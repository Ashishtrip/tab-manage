import { useState } from "react";
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
}

/** What getTabsTree() in tabs.repository.js returns for a single node */
export interface TabTreeNode extends TabRecord {
	children: TabTreeNode[];
}

/** Shape returned by getTabsTree(): { [windowId]: TabTreeNode[] } */
export type TabTree = Record<string, TabTreeNode[]>;

interface TabTreeViewProps {
	tree: TabTree;
	/** Called when a tab's title is clicked. Defaults to opening the url in a new browser tab. */
	onSelectTab?: (tab: TabTreeNode) => void;
	/** Called when a tab's delete button is clicked. If omitted, no delete button is rendered. */
	onDeleteTab?: (tab: TabTreeNode) => void;
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

interface RowProps {
	node: TabTreeNode;
	isLast: boolean;
	ancestorsLast: boolean[];
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
}

function TabTreeRow({ node, isLast, ancestorsLast, onSelectTab, onDeleteTab }: RowProps) {
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.children.length > 0;
	const dotColor = groupColor(node.groupId);

	const prefix = ancestorsLast.map((last) => (last ? "    " : "\u2502   ")).join("");
	const connector = isLast ? "\u2514\u2500\u2500 " : "\u251c\u2500\u2500 ";

	const handleRowClick = () => {
		if (hasChildren) setExpanded((e) => !e);
	};

	const handleTitleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onSelectTab) {
			onSelectTab(node);
		} else {
			window.open(node.url, "_blank", "noopener,noreferrer");
		}
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDeleteTab?.(node);
	};

	return (
		<div className="tab-tree-branch">
			<div
				className={`tab-tree-row${hasChildren ? " tab-tree-row--toggleable" : ""}`}
				onClick={handleRowClick}
			>
				<span className="tab-tree-guides" aria-hidden="true">
					{prefix}
					{connector}
				</span>

				<span className="tab-tree-caret">
					{hasChildren ? (expanded ? "\u25be" : "\u25b8") : ""}
				</span>

				{dotColor && (
					<span
						className="tab-tree-group-dot"
						style={{ backgroundColor: dotColor }}
						title={`Group ${node.groupId}`}
					/>
				)}

				<span
					className={`tab-tree-status tab-tree-status--${node.status ?? "unknown"}`}
					title={node.status ?? "unknown"}
				/>

				<span
					className="tab-tree-title"
					onClick={handleTitleClick}
					title={node.url}
				>
					{node.title || node.url}
				</span>

				{onDeleteTab && (
					<button
						type="button"
						className="tab-tree-delete"
						onClick={handleDeleteClick}
						title="Close tab"
						aria-label={`Close ${node.title || node.url}`}
					>
						&times;
					</button>
				)}
			</div>

			{expanded && hasChildren && (
				<div className="tab-tree-children">
					{node.children.map((child, i) => (
						<TabTreeRow
							key={child.id}
							node={child}
							isLast={i === node.children.length - 1}
							ancestorsLast={[...ancestorsLast, isLast]}
							onSelectTab={onSelectTab}
							onDeleteTab={onDeleteTab}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function TabTreeView({ tree, onSelectTab, onDeleteTab }: TabTreeViewProps) {
	const windowIds = Object.keys(tree);

	if (windowIds.length === 0) {
		return <div className="tab-tree-empty">No tabs tracked yet.</div>;
	}

	return (
		<div className="tab-tree">
			{windowIds.map((windowId) => {
				const roots = tree[windowId];
				return (
					<div key={windowId} className="tab-tree-window">
						<div className="tab-tree-window-header">
							window {windowId}
							<span className="tab-tree-window-count">
								{countTabs(roots)} tab{countTabs(roots) === 1 ? "" : "s"}
							</span>
						</div>
						{roots.map((root, i) => (
							<TabTreeRow
								key={root.id}
								node={root}
								isLast={i === roots.length - 1}
								ancestorsLast={[]}
								onSelectTab={onSelectTab}
								onDeleteTab={onDeleteTab}
							/>
						))}
					</div>
				);
			})}
		</div>
	);
}

function countTabs(nodes: TabTreeNode[]): number {
	if (!Array.isArray(nodes)) return 0;
	return nodes.reduce((sum, n) => sum + 1 + countTabs(n.children ?? []), 0);
}
