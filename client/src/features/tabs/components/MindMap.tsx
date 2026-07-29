import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { TreeEntry, TabTreeNode, FolderTreeNode } from "./TabTree";
import "./MindMap.css";

interface MindMapProps {
	entries: TreeEntry[];
	windowId: number;
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
	onDeleteFolder?: (folder: FolderTreeNode) => void;
}

interface PositionedNode {
	key: string;
	entry: TreeEntry;
	x: number;
	y: number;
	depth: number;
	parent: { x: number; y: number };
}

interface ViewTransform {
	scale: number;
	x: number;
	y: number;
}

// Layout constants: each ring of the map sits RADIUS_STEP further out than the last.
const BASE_RADIUS = 130;
const RADIUS_STEP = 140;
const GAP_RATIO = 0.16; // fraction of each node's angular slice left as breathing room
const MIN_SCALE = 0.3;
const MAX_SCALE = 2.4;

function faviconUrl(url: string): string | null {
	try {
		const { hostname } = new URL(url);
		return `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
	} catch {
		return null;
	}
}

/** How many leaf slots a node should reserve in its parent's arc. Collapsed folders count as one. */
function leafWeight(entry: TreeEntry, collapsed: Set<string>): number {
	if (entry.type === "tab") return 1;
	if (collapsed.has(entry.id) || entry.children.length === 0) return 1;
	return entry.children.reduce((sum, child) => sum + leafWeight(child, collapsed), 0);
}

function countTabs(entry: TreeEntry): number {
	if (entry.type === "tab") return 1;
	return entry.children.reduce((sum, child) => sum + countTabs(child), 0);
}

function layoutTree(entries: TreeEntry[], collapsed: Set<string>): PositionedNode[] {
	const nodes: PositionedNode[] = [];

	function place(
		list: TreeEntry[],
		startAngle: number,
		endAngle: number,
		depth: number,
		parent: { x: number; y: number }
	) {
		const total = list.reduce((sum, e) => sum + leafWeight(e, collapsed), 0) || 1;
		const radius = BASE_RADIUS + (depth - 1) * RADIUS_STEP;
		let cursor = startAngle;

		for (const entry of list) {
			const weight = leafWeight(entry, collapsed);
			const rawSpan = (endAngle - startAngle) * (weight / total);
			const gap = rawSpan * GAP_RATIO;
			const span = Math.max(rawSpan - gap, 0);
			const angle = cursor + gap / 2 + span / 2;
			const x = Math.cos(angle) * radius;
			const y = Math.sin(angle) * radius;

			nodes.push({ key: `${entry.type}:${entry.id}`, entry, x, y, depth, parent });

			const isOpenFolder = entry.type === "folder" && !collapsed.has(entry.id) && entry.children.length > 0;
			if (isOpenFolder) {
				place(entry.children, cursor + gap / 2, cursor + gap / 2 + span, depth + 1, { x, y });
			}
			cursor += rawSpan;
		}
	}

	place(entries, 0, Math.PI * 2, 1, { x: 0, y: 0 });
	return nodes;
}

function fitTransform(nodes: PositionedNode[], width: number, height: number): ViewTransform {
	if (width === 0 || height === 0) return { scale: 1, x: width / 2, y: height / 2 };
	if (nodes.length === 0) return { scale: 1, x: width / 2, y: height / 2 };

	let minX = 0;
	let maxX = 0;
	let minY = 0;
	let maxY = 0;
	for (const n of nodes) {
		minX = Math.min(minX, n.x);
		maxX = Math.max(maxX, n.x);
		minY = Math.min(minY, n.y);
		maxY = Math.max(maxY, n.y);
	}

	const pad = 130;
	const contentW = maxX - minX + pad * 2;
	const contentH = maxY - minY + pad * 2;
	const scale = Math.min(1.1, width / contentW, height / contentH);
	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;

	return {
		scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)),
		x: width / 2 - cx * scale,
		y: height / 2 - cy * scale,
	};
}

function FolderGlyph() {
	return (
		<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
			<path
				d="M2.5 5.3c0-.83.67-1.5 1.5-1.5h3.6l1.6 1.8H16c.83 0 1.5.67 1.5 1.5v6.6c0 .83-.67 1.5-1.5 1.5H4c-.83 0-1.5-.67-1.5-1.5V5.3Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default function MindMap({ entries, windowId, onSelectTab, onDeleteTab, onDeleteFolder }: MindMapProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
	const [transform, setTransform] = useState<ViewTransform>({ scale: 1, x: 0, y: 0 });
	const panRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });

	// Collapsing state resets when we switch to a different window's map.
	useEffect(() => {
		setCollapsed(new Set());
	}, [windowId]);

	const nodes = useMemo(() => layoutTree(entries, collapsed), [entries, collapsed]);
	const totalTabs = useMemo(() => entries.reduce((sum, e) => sum + countTabs(e), 0), [entries]);

	const recenter = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		setTransform(fitTransform(nodes, rect.width, rect.height));
	}, [nodes]);

	useEffect(() => {
		recenter();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [windowId, entries, collapsed]);

	useEffect(() => {
		const el = containerRef.current;
		if (!el || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() => recenter());
		observer.observe(el);
		return () => observer.disconnect();
	}, [recenter]);

	const zoomBy = (factor: number) => {
		setTransform((t) => ({ ...t, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor)) }));
	};

	const handleWheel = (e: React.WheelEvent) => {
		e.preventDefault();
		zoomBy(e.deltaY > 0 ? 0.9 : 1.1);
	};

	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if ((e.target as HTMLElement).closest(".mindmap-node")) return;
		panRef.current = { active: true, startX: e.clientX, startY: e.clientY, origX: transform.x, origY: transform.y };
		e.currentTarget.setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!panRef.current.active) return;
		const dx = e.clientX - panRef.current.startX;
		const dy = e.clientY - panRef.current.startY;
		setTransform((t) => ({ ...t, x: panRef.current.origX + dx, y: panRef.current.origY + dy }));
	};

	const handlePointerUp = () => {
		panRef.current.active = false;
	};

	const toggleFolder = (id: string) => {
		setCollapsed((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<div className="mindmap">
			<div className="mindmap-toolbar">
				<button type="button" className="mindmap-toolbar-btn" onClick={() => zoomBy(1.25)} title="Zoom in" aria-label="Zoom in">
					+
				</button>
				<button type="button" className="mindmap-toolbar-btn" onClick={() => zoomBy(0.8)} title="Zoom out" aria-label="Zoom out">
					&minus;
				</button>
				<button type="button" className="mindmap-toolbar-btn" onClick={recenter} title="Reset view" aria-label="Reset view">
					<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
						<path
							d="M8 2.5a5.5 5.5 0 1 1-4 1.7M4 1v3.4h3.4"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>

			{entries.length === 0 ? (
				<div className="mindmap-empty">No tabs in this window.</div>
			) : (
				<div
					ref={containerRef}
					className="mindmap-viewport"
					onWheel={handleWheel}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerLeave={handlePointerUp}
				>
					<div
						className="mindmap-canvas"
						style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
					>
						<svg className="mindmap-links" width="1" height="1">
							{nodes.map((n) => {
								const midX = (n.parent.x + n.x) / 2;
								const d = `M ${n.parent.x} ${n.parent.y} Q ${midX} ${n.parent.y}, ${n.x} ${n.y}`;
								return (
									<path
										key={`link-${n.key}`}
										d={d}
										className="mindmap-link"
										style={{ opacity: Math.max(0.28, 1 - (n.depth - 1) * 0.16) }}
									/>
								);
							})}
						</svg>

						<div className="mindmap-node mindmap-node--root">
							<span className="mindmap-node-label">
								{totalTabs} tab{totalTabs === 1 ? "" : "s"}
							</span>
						</div>

						{nodes.map((n) => {
							const isFolder = n.entry.type === "folder";
							const isCollapsed = isFolder && collapsed.has(n.entry.id);
							const tab = !isFolder ? (n.entry as TabTreeNode) : null;
							const folder = isFolder ? (n.entry as FolderTreeNode) : null;
							const favicon = tab ? faviconUrl(tab.url) : null;
							const canDelete = isFolder ? !!onDeleteFolder : !!onDeleteTab;
							const nodeOpacity = Math.max(0.6, 1 - (n.depth - 1) * 0.1);

							return (
								<div
									key={n.key}
									className={`mindmap-node mindmap-node--${n.entry.type}${isCollapsed ? " mindmap-node--collapsed" : ""}`}
									style={{ left: n.x, top: n.y, opacity: nodeOpacity }}
									onClick={() => {
										if (folder) toggleFolder(folder.id);
										else if (tab) onSelectTab?.(tab);
									}}
									title={folder ? folder.name : tab?.title || tab?.url}
								>
									{folder ? (
										<span className="mindmap-node-icon mindmap-node-icon--folder">
											<FolderGlyph />
										</span>
									) : favicon ? (
										<img
											src={favicon}
											alt=""
											className="mindmap-node-icon mindmap-node-icon--favicon"
											onError={(e) => {
												e.currentTarget.style.visibility = "hidden";
											}}
										/>
									) : (
										<span className="mindmap-node-icon mindmap-node-icon--placeholder" />
									)}

									<span className="mindmap-node-label">{folder ? folder.name : tab?.title || tab?.url}</span>

									{folder && <span className="mindmap-node-badge">{countTabs(folder)}</span>}

									{canDelete && (
										<button
											type="button"
											className="mindmap-node-delete"
											onClick={(e) => {
												e.stopPropagation();
												if (folder) onDeleteFolder?.(folder);
												else if (tab) onDeleteTab?.(tab);
											}}
											aria-label={folder ? `Delete ${folder.name}` : `Close ${tab?.title || tab?.url}`}
										>
											&times;
										</button>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
