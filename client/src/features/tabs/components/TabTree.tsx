import { useState } from "react";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";
import Modal from "./Modal";
import "./TabTree.css";

/** Mirrors the Mongoose schema in tabs.model.js */
export interface TabRecord {
	id: number;
	index: number;
	windowId: number;
	groupId: number;
	url: string;
	title: string;
	openerTabId?: number;
	status?: string;
	folderId?: string | null;
	order?: number;
}

/** Mirrors the Mongoose schema in folders.model.js */
export interface FolderRecord {
	id: string;
	name: string;
	windowId: number;
	parentFolderId?: string | null;
	order?: number;
}

export interface TabTreeNode extends TabRecord {
	type: "tab";
	children: TreeEntry[];
}

export interface FolderTreeNode extends FolderRecord {
	type: "folder";
	children: TreeEntry[];
}

export type TreeEntry = TabTreeNode | FolderTreeNode;

/** Shape returned by constructTree(): { [windowId]: TreeEntry[] } */
export type TabTree = Record<string, TreeEntry[]>;

/** Where a new tab/folder should be created: which window, and optionally inside which folder */
export interface CreationContext {
	windowId: number;
	parentFolderId: string | null;
}

/** Payload for a drag-and-drop arrangement move. */
export interface MoveEntryPayload {
	id: number | string;
	kind: "tab" | "folder";
	order: number;
	folderId?: string | null;
	parentFolderId?: string | null;
}

interface TabTreeViewProps {
	/** The entries for a single window (get this via tree[windowId] from the parent). */
	entries: TreeEntry[];
	windowId: number;
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
	onDeleteFolder?: (folder: FolderTreeNode) => void;
	onRenameFolder?: (folder: FolderTreeNode, name: string) => void;
	onCreateTab?: (context: CreationContext, url: string) => void;
	onCreateFolder?: (context: CreationContext, name: string) => void;
	onMoveEntry?: (move: MoveEntryPayload) => void;
}

function faviconUrl(url: string): string | null {
	try {
		const { hostname } = new URL(url);
		return `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
	} catch {
		return null;
	}
}

function countDescendantTabs(nodes: TreeEntry[]): number {
	if (!Array.isArray(nodes)) return 0;
	return nodes.reduce(
		(sum, n) => sum + (n.type === "tab" ? 1 : 0) + countDescendantTabs(n.children ?? []),
		0
	);
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
	return (
		<svg
			className={`tab-tree-chevron${expanded ? " tab-tree-chevron--expanded" : ""}`}
			viewBox="0 0 16 16"
			width="12"
			height="12"
			aria-hidden="true"
		>
			<path d="M5 3.5L10.5 8L5 12.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

// Thin outline folder glyph, matching a plain file-manager look.
function FolderIcon() {
	return (
		<svg className="tab-tree-folder-icon" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
			<path
				d="M2.5 5.3c0-.83.67-1.5 1.5-1.5h3.6l1.6 1.8H16c.83 0 1.5.67 1.5 1.5v6.6c0 .83-.67 1.5-1.5 1.5H4c-.83 0-1.5-.67-1.5-1.5V5.3Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.4"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function dragPayload(e: React.DragEvent): { id: number | string; kind: "tab" | "folder" } | null {
	try {
		const raw = e.dataTransfer.getData("application/json");
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

interface RowProps {
	node: TreeEntry;
	depth: number;
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
	onDeleteFolder?: (folder: FolderTreeNode) => void;
	onContextMenuRequest: (e: React.MouseEvent, context: CreationContext, targetFolder: FolderTreeNode | null) => void;
	onMoveEntry?: (move: MoveEntryPayload) => void;
}

function TreeRow({
	node,
	depth,
	onSelectTab,
	onDeleteTab,
	onDeleteFolder,
	onContextMenuRequest,
	onMoveEntry,
}: RowProps) {
	const [expanded, setExpanded] = useState(true);
	const [dropZone, setDropZone] = useState<"before" | "after" | "inside" | null>(null);
	const hasChildren = node.children.length > 0;
	const isFolder = node.type === "folder";
	const favicon = !isFolder ? faviconUrl(node.url) : null;
	const tabCount = isFolder ? countDescendantTabs(node.children) : 0;

	const handleRowClick = () => {
		if (isFolder) {
			setExpanded((v) => !v);
			return;
		}
		if (hasChildren) {
			setExpanded((v) => !v);
			return;
		}
		if (onSelectTab) onSelectTab(node);
		else window.open(node.url, "_blank", "noopener,noreferrer");
	};

	const handleChevronClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setExpanded((v) => !v);
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isFolder) onDeleteFolder?.(node);
		else onDeleteTab?.(node);
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const context: CreationContext = isFolder
			? { windowId: node.windowId, parentFolderId: node.id }
			: { windowId: node.windowId, parentFolderId: node.folderId ?? null };
		onContextMenuRequest(e, context, isFolder ? node : null);
	};

	const handleDragStart = (e: React.DragEvent) => {
		e.dataTransfer.setData("application/json", JSON.stringify({ id: node.id, kind: node.type }));
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		
		const rect = e.currentTarget.getBoundingClientRect();
		const y = e.clientY - rect.top;
		const height = rect.height;

		if (isFolder) {
			if (y < height * 0.25) {
				setDropZone("before");
			} else if (y > height * 0.75) {
				setDropZone("after");
			} else {
				setDropZone("inside");
			}
		} else {
			if (y < height * 0.5) {
				setDropZone("before");
			} else {
				setDropZone("after");
			}
		}
	};

	const handleDragLeave = () => setDropZone(null);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const zone = dropZone;
		setDropZone(null);

		const dragged = dragPayload(e);
		if (!dragged || !onMoveEntry) return;
		if (dragged.kind === node.type && dragged.id === node.id) return;

		if (isFolder) {
			if (dragged.kind === "folder" && dragged.id === node.id) return;

			if (zone === "inside") {
				const maxOrder = node.children.reduce((max, c) => Math.max(max, c.order ?? 0), 0);
				onMoveEntry({
					id: dragged.id,
					kind: dragged.kind,
					order: maxOrder + 1,
					folderId: dragged.kind === "tab" ? node.id : undefined,
					parentFolderId: dragged.kind === "folder" ? node.id : undefined,
				});
			} else {
				const orderOffset = zone === "before" ? -0.5 : 0.5;
				// node is folder, so its parent is node.parentFolderId
				const targetFolderId = node.parentFolderId;
				onMoveEntry({
					id: dragged.id,
					kind: dragged.kind,
					order: (node.order ?? 0) + orderOffset,
					folderId: dragged.kind === "tab" ? targetFolderId ?? null : undefined,
					parentFolderId: dragged.kind === "folder" ? targetFolderId ?? null : undefined,
				});
			}
		} else {
			const orderOffset = zone === "before" ? -0.5 : 0.5;
			// node is tab, so its parent is node.folderId
			const targetFolderId = node.folderId;
			onMoveEntry({
				id: dragged.id,
				kind: dragged.kind,
				order: (node.order ?? 0) + orderOffset,
				folderId: dragged.kind === "tab" ? targetFolderId ?? null : undefined,
				parentFolderId: dragged.kind === "folder" ? targetFolderId ?? null : undefined,
			});
		}
	};

	const canDelete = isFolder ? !!onDeleteFolder : !!onDeleteTab;
	const dropClass = dropZone ? ` tab-tree-row--drop-${dropZone}` : "";

	return (
		<div className="tab-tree-branch">
			<div
				className={`tab-tree-row${dropClass}`}
				style={{ paddingLeft: 8 + depth * 18 }}
				onClick={handleRowClick}
				onContextMenu={handleContextMenu}
				draggable={!!onMoveEntry}
				onDragStart={handleDragStart}
				onDragOver={onMoveEntry ? handleDragOver : undefined}
				onDragLeave={onMoveEntry ? handleDragLeave : undefined}
				onDrop={onMoveEntry ? handleDrop : undefined}
			>
				<span className="tab-tree-chevron-slot" onClick={hasChildren ? handleChevronClick : undefined}>
					{hasChildren && <ChevronIcon expanded={expanded} />}
				</span>

				{isFolder ? (
					<FolderIcon />
				) : favicon ? (
					<img
						src={favicon}
						alt=""
						className="tab-tree-favicon"
						onError={(e) => {
							e.currentTarget.style.visibility = "hidden";
						}}
					/>
				) : (
					<span className="tab-tree-favicon tab-tree-favicon--placeholder" />
				)}

				<span className={`tab-tree-title${isFolder ? " tab-tree-title--folder" : ""}`} title={isFolder ? node.name : node.url}>
					{isFolder ? node.name : node.title || node.url}
				</span>

				{!isFolder && (
					<span
						className={`tab-tree-status tab-tree-status--${node.status ?? "unknown"}`}
						title={node.status ?? "unknown"}
					/>
				)}

				{canDelete && (
					<button
						type="button"
						className="tab-tree-delete"
						onClick={handleDeleteClick}
						title={isFolder ? "Delete folder" : "Close tab"}
						aria-label={isFolder ? `Delete ${node.name}` : `Close ${node.title || node.url}`}
					>
						&times;
					</button>
				)}

				{isFolder && <span className="tab-tree-count-badge">{tabCount}</span>}
			</div>

			{expanded && hasChildren && (
				<div className="tab-tree-children" style={{ marginLeft: 8 + depth * 18 + 6 }}>
					{node.children.map((child) => (
						<TreeRow
							key={`${child.type}:${child.id}`}
							node={child}
							depth={0}
							onSelectTab={onSelectTab}
							onDeleteTab={onDeleteTab}
							onDeleteFolder={onDeleteFolder}
							onContextMenuRequest={onContextMenuRequest}
							onMoveEntry={onMoveEntry}
						/>
					))}
				</div>
			)}
		</div>
	);
}

interface OpenMenuState {
	x: number;
	y: number;
	context: CreationContext;
	targetFolder: FolderTreeNode | null;
}

type PendingModal =
	| { kind: "create-tab"; context: CreationContext }
	| { kind: "create-folder"; context: CreationContext }
	| { kind: "rename-folder"; folder: FolderTreeNode };

export default function TabTreeView({
	entries,
	windowId,
	onSelectTab,
	onDeleteTab,
	onDeleteFolder,
	onRenameFolder,
	onCreateTab,
	onCreateFolder,
	onMoveEntry,
}: TabTreeViewProps) {
	const [menu, setMenu] = useState<OpenMenuState | null>(null);
	const [pendingModal, setPendingModal] = useState<PendingModal | null>(null);
	const [rootDragOver, setRootDragOver] = useState(false);

	const openMenu = (e: React.MouseEvent, context: CreationContext, targetFolder: FolderTreeNode | null) => {
		setMenu({ x: e.clientX, y: e.clientY, context, targetFolder });
	};

	const menuItems: ContextMenuItem[] = menu
		? [
				...(onCreateTab
					? [{ label: "Add tab", onSelect: () => setPendingModal({ kind: "create-tab", context: menu.context }) }]
					: []),
				...(onCreateFolder
					? [{ label: "Create folder", onSelect: () => setPendingModal({ kind: "create-folder", context: menu.context }) }]
					: []),
				...(menu.targetFolder && onRenameFolder
					? [{ label: "Rename folder", onSelect: () => setPendingModal({ kind: "rename-folder", folder: menu.targetFolder! }) }]
					: []),
				...(menu.targetFolder && onDeleteFolder
					? [{ label: "Delete folder", onSelect: () => onDeleteFolder(menu.targetFolder!) }]
					: []),
			]
		: [];

	const handlePanelContextMenu = (e: React.MouseEvent) => {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		openMenu(e, { windowId, parentFolderId: null }, null);
	};

	const handleRootDragOver = (e: React.DragEvent) => {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		setRootDragOver(true);
	};

	const handleRootDrop = (e: React.DragEvent) => {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		setRootDragOver(false);
		const dragged = dragPayload(e);
		if (!dragged || !onMoveEntry) return;
		const maxOrder = entries.reduce((max, n) => Math.max(max, n.order ?? 0), 0);
		onMoveEntry({
			id: dragged.id,
			kind: dragged.kind,
			order: maxOrder + 1,
			folderId: dragged.kind === "tab" ? null : undefined,
			parentFolderId: dragged.kind === "folder" ? null : undefined,
		});
	};

	return (
		<div
			className={`tab-tree${rootDragOver ? " tab-tree--drag-over" : ""}`}
			onContextMenu={handlePanelContextMenu}
			onDragOver={onMoveEntry ? handleRootDragOver : undefined}
			onDragLeave={onMoveEntry ? () => setRootDragOver(false) : undefined}
			onDrop={onMoveEntry ? handleRootDrop : undefined}
		>
			{entries.length === 0 ? (
				<div className="tab-tree-empty">No tabs in this window.</div>
			) : (
				entries.map((entry) => (
					<TreeRow
						key={`${entry.type}:${entry.id}`}
						node={entry}
						depth={0}
						onSelectTab={onSelectTab}
						onDeleteTab={onDeleteTab}
						onDeleteFolder={onDeleteFolder}
						onContextMenuRequest={openMenu}
						onMoveEntry={onMoveEntry}
					/>
				))
			)}

			{menu && menuItems.length > 0 && (
				<ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
			)}

			{pendingModal?.kind === "create-tab" && (
				<Modal
					title="Open a new tab"
					placeholder="https://example.com"
					confirmLabel="Open"
					onSubmit={(url) => {
						onCreateTab?.(pendingModal.context, url);
						setPendingModal(null);
					}}
					onCancel={() => setPendingModal(null)}
				/>
			)}

			{pendingModal?.kind === "create-folder" && (
				<Modal
					title="New folder"
					placeholder="Folder name"
					confirmLabel="Create"
					onSubmit={(name) => {
						onCreateFolder?.(pendingModal.context, name);
						setPendingModal(null);
					}}
					onCancel={() => setPendingModal(null)}
				/>
			)}

			{pendingModal?.kind === "rename-folder" && (
				<Modal
					title="Rename folder"
					placeholder="Folder name"
					confirmLabel="Rename"
					initialValue={pendingModal.folder.name}
					onSubmit={(name) => {
						onRenameFolder?.(pendingModal.folder, name);
						setPendingModal(null);
					}}
					onCancel={() => setPendingModal(null)}
				/>
			)}
		</div>
	);
}
