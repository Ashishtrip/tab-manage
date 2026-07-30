import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { TreeEntry, TabTreeNode } from "./TabTree";
import "./MindMap.css";

interface MindMapProps {
	entries: TreeEntry[];
	windowId: number;
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
}

/** A tab plus the tabs it opened (derived from openerTabId, not folder membership). */
interface OpenerNode {
	tab: TabTreeNode;
	children: OpenerNode[];
}

interface PositionedNode {
	key: string;
	node: OpenerNode;
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
// These are sized generously against the node pill's max-width (190px) so that even a
// straight one-child-per-tab chain (which places nodes along the same ray) clears the
// hub and each other, rather than stacking on top of one another.
const BASE_RADIUS = 190;
const RADIUS_STEP = 230;
const GAP_RATIO = 0.22; // fraction of each node's angular slice left as breathing room
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

/** Pull every tab out of the folder tree, regardless of which folder (if any) it lives in. */
function flattenTabs(entries: TreeEntry[]): TabTreeNode[] {
	const out: TabTreeNode[] = [];
	function walk(list: TreeEntry[]) {
		for (const e of list) {
			if (e.type === "tab") out.push(e);
			if (e.children && e.children.length > 0) walk(e.children);
		}
	}
	walk(entries);
	return out;
}

/**
 * Group tabs into a forest based on which tab opened which (openerTabId), i.e. the
 * browser's actual parent/child lineage, independent of how tabs are filed into folders.
 * A tab becomes a root if it has no openerTabId, opened itself, or its opener has since
 * closed (no longer present in this window).
 */
function buildOpenerForest(tabs: TabTreeNode[]): OpenerNode[] {
	const byId = new Map(tabs.map((t) => [t.id, t]));
	const childIdsByOpener = new Map<number, TabTreeNode[]>();
	const roots: TabTreeNode[] = [];

	for (const t of tabs) {
		const openerId = t.openerTabId;
		if (openerId != null && openerId !== t.id && byId.has(openerId)) {
			if (!childIdsByOpener.has(openerId)) childIdsByOpener.set(openerId, []);
			childIdsByOpener.get(openerId)!.push(t);
		} else {
			roots.push(t);
		}
	}

	function build(tab: TabTreeNode): OpenerNode {
		return { tab, children: (childIdsByOpener.get(tab.id) ?? []).map(build) };
	}

	return roots.map(build);
}

function subtreeSize(node: OpenerNode): number {
	return 1 + node.children.reduce((sum, c) => sum + subtreeSize(c), 0);
}

/** How many leaf slots a node should reserve in its parent's arc. Collapsed nodes count as one. */
function leafWeight(node: OpenerNode, collapsed: Set<number>): number {
	if (collapsed.has(node.tab.id) || node.children.length === 0) return 1;
	return node.children.reduce((sum, c) => sum + leafWeight(c, collapsed), 0);
}

function layoutForest(forest: OpenerNode[], collapsed: Set<number>): PositionedNode[] {
	const nodes: PositionedNode[] = [];

	function place(
		list: OpenerNode[],
		startAngle: number,
		endAngle: number,
		depth: number,
		parent: { x: number; y: number }
	) {
		const total = list.reduce((sum, n) => sum + leafWeight(n, collapsed), 0) || 1;
		const radius = BASE_RADIUS + (depth - 1) * RADIUS_STEP;
		let cursor = startAngle;

		for (const node of list) {
			const weight = leafWeight(node, collapsed);
			const rawSpan = (endAngle - startAngle) * (weight / total);
			const gap = rawSpan * GAP_RATIO;
			const span = Math.max(rawSpan - gap, 0);
			const angle = cursor + gap / 2 + span / 2;
			const x = Math.cos(angle) * radius;
			const y = Math.sin(angle) * radius;

			nodes.push({ key: `tab:${node.tab.id}`, node, x, y, depth, parent });

			const isOpen = !collapsed.has(node.tab.id) && node.children.length > 0;
			if (isOpen) {
				place(node.children, cursor + gap / 2, cursor + gap / 2 + span, depth + 1, { x, y });
			}
			cursor += rawSpan;
		}
	}

	place(forest, 0, Math.PI * 2, 1, { x: 0, y: 0 });
	return nodes;
}

function fitTransform(nodes: PositionedNode[], width: number, height: number): ViewTransform {
	if (width === 0 || height === 0 || nodes.length === 0) return { scale: 1, x: width / 2, y: height / 2 };

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

export default function MindMap({ entries, windowId, onSelectTab, onDeleteTab }: MindMapProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
	const [transform, setTransform] = useState<ViewTransform>({ scale: 1, x: 0, y: 0 });
	const panRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });

	// Collapsing state resets when we switch to a different window's map.
	useEffect(() => {
		setCollapsed(new Set());
	}, [windowId]);

	const tabs = useMemo(() => flattenTabs(entries), [entries]);
	const forest = useMemo(() => buildOpenerForest(tabs), [tabs]);
	const nodes = useMemo(() => layoutForest(forest, collapsed), [forest, collapsed]);

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

	const toggleCollapse = (id: number) => {
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

			{tabs.length === 0 ? (
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
										style={{ opacity: Math.max(0.55, 1 - (n.depth - 1) * 0.1) }}
									/>
								);
							})}
						</svg>

						<div className="mindmap-node mindmap-node--root">
							<span className="mindmap-node-label">
								{tabs.length} tab{tabs.length === 1 ? "" : "s"}
							</span>
						</div>

						{nodes.map((n) => {
							const { tab } = n.node;
							const isCollapsed = collapsed.has(tab.id);
							const hasChildren = n.node.children.length > 0;
							const favicon = faviconUrl(tab.url);
							const openedCount = hasChildren ? subtreeSize(n.node) - 1 : 0;
							const nodeOpacity = Math.max(0.6, 1 - (n.depth - 1) * 0.1);

							return (
								<div
									key={n.key}
									className={`mindmap-node mindmap-node--tab${isCollapsed ? " mindmap-node--collapsed" : ""}`}
									style={{ left: n.x, top: n.y, opacity: nodeOpacity }}
									onClick={() => onSelectTab?.(tab)}
									title={tab.title || tab.url}
								>
									{favicon ? (
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

									<span className="mindmap-node-label">{tab.title || tab.url}</span>

									{hasChildren && (
										<>
											<span className="mindmap-node-badge" title={`${openedCount} tab${openedCount === 1 ? "" : "s"} opened from here`}>
												{openedCount}
											</span>
											<button
												type="button"
												className="mindmap-node-toggle"
												onClick={(e) => {
													e.stopPropagation();
													toggleCollapse(tab.id);
												}}
												aria-label={isCollapsed ? "Expand opened tabs" : "Collapse opened tabs"}
												title={isCollapsed ? "Expand opened tabs" : "Collapse opened tabs"}
											>
												{isCollapsed ? "+" : "\u2212"}
											</button>
										</>
									)}

									{onDeleteTab && (
										<button
											type="button"
											className="mindmap-node-delete"
											onClick={(e) => {
												e.stopPropagation();
												onDeleteTab(tab);
											}}
											aria-label={`Close ${tab.title || tab.url}`}
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
