import { useState } from "react";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";
import "./TabTree.css";

/**
 * Mirrors the Mongoose schema in tabs.model.js
 */
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
	tree: TabTree;
	/** Called when a tab's title is clicked. Defaults to opening the url in a new browser tab. */
	onSelectTab?: (tab: TabTreeNode) => void;
	/** Called when a tab's delete button is clicked. If omitted, no delete button is rendered. */
	onDeleteTab?: (tab: TabTreeNode) => void;
	/** Called when a folder's delete button is clicked. If omitted, no delete button is rendered. */
	onDeleteFolder?: (folder: FolderTreeNode) => void;
	/** Called from the context menu's "Add tab" option. */
	onCreateTab?: (context: CreationContext) => void;
	/** Called from the context menu's "New folder" option. */
	onCreateFolder?: (context: CreationContext) => void;
}

// Deterministic palette for groupId -> dot shade. We don't have Chrome's
// actual tab-group color on the record, so this just gives each group a
// stable, visually distinct (but muted, grayscale) marker.
const GROUP_PALETTE = [
	"#8a8f98", "#a4a9b0", "#6b7078", "#c1c5cb",
	"#5a5f66", "#9a9ea5", "#7a7f87", "#b0b4ba",
];

const NO_GROUP = -1; // matches Chrome's tabGroups.TAB_GROUP_ID_NONE

function groupColor(groupId: number): string | null {
	if (groupId === NO_GROUP || groupId == null) return null;
	return GROUP_PALETTE[Math.abs(groupId) % GROUP_PALETTE.length];
}

function faviconUrl(url: string): string | null {
	try {
		const { hostname } = new URL(url);
		return `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
	} catch {
		return null;
	}
}

function FolderIcon() {
	return (
		<svg
			className="tab-tree-folder-icon"
			viewBox="0 0 20 20"
			width="13"
			height="13"
			aria-hidden="true"
		>
			<path
				d="M2.5 5.3c0-.83.67-1.5 1.5-1.5h3.6l1.6 1.8H16c.83 0 1.5.67 1.5 1.5v6.6c0 .83-.67 1.5-1.5 1.5H4c-.83 0-1.5-.67-1.5-1.5V5.3Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.3"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

interface RowProps {
	node: TreeEntry;
	isLast: boolean;
	ancestorsLast: boolean[];
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
	onDeleteFolder?: (folder: FolderTreeNode) => void;
	onContextMenuRequest: (e: React.MouseEvent, context: CreationContext) => void;
}

function TreeRow({
	node,
	isLast,
	ancestorsLast,
	onSelectTab,
	onDeleteTab,
	onDeleteFolder,
	onContextMenuRequest,
}: RowProps) {
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.children.length > 0;
	const isFolder = node.type === "folder";
	const dotColor = !isFolder ? groupColor(node.groupId) : null;
	const favicon = !isFolder ? faviconUrl(node.url) : null;

	const prefix = ancestorsLast.map((last) => (last ? "    " : "\u2502   ")).join("");
	const connector = isLast ? "\u2514\u2500\u2500 " : "\u251c\u2500\u2500 ";

	const handleRowClick = () => {
		if (hasChildren || isFolder) setExpanded((e) => !e);
	};

	const handleTitleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isFolder) {
			setExpanded((v) => !v);
			return;
		}
		if (onSelectTab) {
			onSelectTab(node);
		} else {
			window.open(node.url, "_blank", "noopener,noreferrer");
		}
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isFolder) {
			onDeleteFolder?.(node);
		} else {
			onDeleteTab?.(node);
		}
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
				className={`tab-tree-row${hasChildren || isFolder ? " tab-tree-row--toggleable" : ""}`}
				onClick={handleRowClick}
				onContextMenu={handleContextMenu}
			>
				<span className="tab-tree-guides" aria-hidden="true">
					{prefix}
					{connector}
				</span>

				<span className="tab-tree-caret">
					{hasChildren ? (expanded ? "\u25be" : "\u25b8") : ""}
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

				{!isFolder && (
					<span
						className={`tab-tree-status tab-tree-status--${node.status ?? "unknown"}`}
						title={node.status ?? "unknown"}
					/>
				)}

				{!isFolder && dotColor && (
					<span
						className="tab-tree-group-dot"
						style={{ backgroundColor: dotColor }}
						title={`Group ${node.groupId}`}
					/>
				)}

				<span
					className="tab-tree-title"
					onClick={handleTitleClick}
					title={isFolder ? node.name : node.url}
				>
					{isFolder ? node.name : node.title || node.url}
				</span>

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
				<div className="tab-tree-children">
					{node.children.map((child, i) => (
						<TreeRow
							key={`${child.type}:${child.id}`}
							node={child}
							isLast={i === node.children.length - 1}
							ancestorsLast={[...ancestorsLast, isLast]}
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

export default function TabTreeView({
	tree,
	onSelectTab,
	onDeleteTab,
	onDeleteFolder,
	onCreateTab,
	onCreateFolder,
}: TabTreeViewProps) {
	const [menu, setMenu] = useState<OpenMenuState | null>(null);
	const windowIds = Object.keys(tree);

	const openMenu = (e: React.MouseEvent, context: CreationContext) => {
		setMenu({ x: e.clientX, y: e.clientY, context });
	};

	const menuItems: ContextMenuItem[] = menu
		? [
				...(onCreateTab
					? [{ label: "Add tab", onSelect: () => onCreateTab(menu.context) }]
					: []),
				...(onCreateFolder
					? [{ label: "Create folder", onSelect: () => onCreateFolder(menu.context) }]
					: []),
			]
		: [];

	if (windowIds.length === 0) {
		return <div className="tab-tree-empty">No tabs tracked yet.</div>;
	}

	return (
		<div className="tab-tree">
			{windowIds.map((windowId) => {
				const roots = tree[windowId];
				const numericWindowId = Number(windowId);
				return (
					<div key={windowId} className="tab-tree-window">
						<div
							className="tab-tree-window-header"
							onContextMenu={(e) => {
								e.preventDefault();
								openMenu(e, { windowId: numericWindowId, parentFolderId: null });
							}}
						>
							window {windowId}
							<span className="tab-tree-window-count">
								{countTabs(roots)} tab{countTabs(roots) === 1 ? "" : "s"}
							</span>
						</div>
						{roots.map((root, i) => (
							<TreeRow
								key={`${root.type}:${root.id}`}
								node={root}
								isLast={i === roots.length - 1}
								ancestorsLast={[]}
								onSelectTab={onSelectTab}
								onDeleteTab={onDeleteTab}
								onDeleteFolder={onDeleteFolder}
								onContextMenuRequest={openMenu}
							/>
						))}
					</div>
				);
			})}

			{menu && menuItems.length > 0 && (
				<ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
			)}
		</div>
	);
}

function countTabs(nodes: TreeEntry[]): number {
	if (!Array.isArray(nodes)) return 0;
	return nodes.reduce(
		(sum, n) => sum + (n.type === "tab" ? 1 : 0) + countTabs(n.children ?? []),
		0
	);
}
