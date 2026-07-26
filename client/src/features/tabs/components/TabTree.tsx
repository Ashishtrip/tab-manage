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
}

/** Mirrors the Mongoose schema in folders.model.js */
export interface FolderRecord {
	id: string;
	name: string;
	windowId: number;
	parentFolderId?: string | null;
	index?: number;
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

interface TabTreeViewProps {
	/** The entries for a single window (get this via tree[windowId] from the parent). */
	entries: TreeEntry[];
	windowId: number;
	/** Display title for the panel header, e.g. "Window 1". */
	title?: string;
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
	onDeleteFolder?: (folder: FolderTreeNode) => void;
	onCreateTab?: (context: CreationContext, url: string) => void;
	onCreateFolder?: (context: CreationContext, name: string) => void;
}

function faviconUrl(url: string): string | null {
	try {
		const { hostname } = new URL(url);
		return `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
	} catch {
		return null;
	}
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

function FolderIcon() {
	return (
		<svg className="tab-tree-folder-icon" viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
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

interface RowProps {
	node: TreeEntry;
	depth: number;
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
	onDeleteFolder?: (folder: FolderTreeNode) => void;
	onContextMenuRequest: (e: React.MouseEvent, context: CreationContext) => void;
}

function TreeRow({ node, depth, onSelectTab, onDeleteTab, onDeleteFolder, onContextMenuRequest }: RowProps) {
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.children.length > 0;
	const isFolder = node.type === "folder";
	const favicon = !isFolder ? faviconUrl(node.url) : null;

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
		onContextMenuRequest(e, context);
	};

	const canDelete = isFolder ? !!onDeleteFolder : !!onDeleteTab;

	return (
		<div className="tab-tree-branch">
			<div
				className="tab-tree-row"
				style={{ paddingLeft: 8 + depth * 18 }}
				onClick={handleRowClick}
				onContextMenu={handleContextMenu}
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

				<span className="tab-tree-title" title={isFolder ? node.name : node.url}>
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
}

interface PendingCreate {
	type: "tab" | "folder";
	context: CreationContext;
}

function PlusIcon() {
	return (
		<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
			<path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
		</svg>
	);
}

export default function TabTreeView({
	entries,
	windowId,
	title,
	onSelectTab,
	onDeleteTab,
	onDeleteFolder,
	onCreateTab,
	onCreateFolder,
}: TabTreeViewProps) {
	const [menu, setMenu] = useState<OpenMenuState | null>(null);
	const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);

	const openMenu = (e: React.MouseEvent, context: CreationContext) => {
		setMenu({ x: e.clientX, y: e.clientY, context });
	};

	const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setMenu({ x: rect.left, y: rect.bottom + 4, context: { windowId, parentFolderId: null } });
	};

	const menuItems: ContextMenuItem[] = menu
		? [
				...(onCreateTab
					? [{ label: "Add tab", onSelect: () => setPendingCreate({ type: "tab", context: menu.context }) }]
					: []),
				...(onCreateFolder
					? [{ label: "Create folder", onSelect: () => setPendingCreate({ type: "folder", context: menu.context }) }]
					: []),
			]
		: [];

	const handlePanelContextMenu = (e: React.MouseEvent) => {
		if (e.target !== e.currentTarget) return; // let row-level handlers own their own right-clicks
		e.preventDefault();
		openMenu(e, { windowId, parentFolderId: null });
	};

	return (
		<div className="tab-tree-panel">
			{title && (
				<div className="tab-tree-panel-header">
					<span className="tab-tree-panel-title">{title}</span>
					{(onCreateTab || onCreateFolder) && (
						<button type="button" className="tab-tree-add-button" onClick={handleAddClick} title="Add">
							<PlusIcon />
						</button>
					)}
				</div>
			)}

			<div className="tab-tree" onContextMenu={handlePanelContextMenu}>
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
						/>
					))
				)}

				{menu && menuItems.length > 0 && (
					<ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
				)}

				{pendingCreate?.type === "tab" && (
					<Modal
						title="Open a new tab"
						placeholder="https://example.com"
						confirmLabel="Open"
						onSubmit={(url) => {
							onCreateTab?.(pendingCreate.context, url);
							setPendingCreate(null);
						}}
						onCancel={() => setPendingCreate(null)}
					/>
				)}

				{pendingCreate?.type === "folder" && (
					<Modal
						title="New folder"
						placeholder="Folder name"
						confirmLabel="Create"
						onSubmit={(name) => {
							onCreateFolder?.(pendingCreate.context, name);
							setPendingCreate(null);
						}}
						onCancel={() => setPendingCreate(null)}
					/>
				)}
			</div>
		</div>
	);
}
