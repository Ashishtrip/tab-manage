import { useEffect, useState } from "react";
import WindowSidebar from "../../windows/components/WindowSidebar";
import SearchResults from "./SearchResults";
import TabTreeView, {
	type TabTree,
	type TabTreeNode,
	type FolderTreeNode,
	type CreationContext,
	type MoveEntryPayload,
} from "./TabTree";
import { searchTree } from "../treeUtils";
import "../../../styles/theme.css";
import "./AppLayout.css";

interface AppLayoutProps {
	tree: TabTree;
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
	onDeleteFolder?: (folder: FolderTreeNode) => void;
	onRenameFolder?: (folder: FolderTreeNode, name: string) => void;
	onCreateTab?: (context: CreationContext, url: string) => void;
	onCreateFolder?: (context: CreationContext, name: string) => void;
	onMoveEntry?: (move: MoveEntryPayload) => void;
}

export default function AppLayout({
	tree,
	onSelectTab,
	onDeleteTab,
	onDeleteFolder,
	onRenameFolder,
	onCreateTab,
	onCreateFolder,
	onMoveEntry,
}: AppLayoutProps) {
	const windowIds = Object.keys(tree);
	const [activeWindowId, setActiveWindowId] = useState<string | null>(windowIds[0] ?? null);
	const [searchQuery, setSearchQuery] = useState("");

	// Keep the selection valid as windows open/close.
	useEffect(() => {
		if (activeWindowId && windowIds.includes(activeWindowId)) return;
		setActiveWindowId(windowIds[0] ?? null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [windowIds.join(",")]);

	const activeIndex = activeWindowId ? windowIds.indexOf(activeWindowId) : -1;
	const entries = activeWindowId ? tree[activeWindowId] ?? [] : [];
	const isSearching = searchQuery.trim().length > 0;
	const searchResults = isSearching ? searchTree(tree, searchQuery) : [];

	const handleSelectWindow = (windowId: string) => {
		setActiveWindowId(windowId);
		setSearchQuery("");
	};

	return (
		<div className="app-layout">
			<WindowSidebar
				tree={tree}
				activeWindowId={activeWindowId}
				onSelectWindow={handleSelectWindow}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>
			<div className="app-layout-divider" />
			<main className="app-layout-main">
				{isSearching ? (
					<div className="tab-tree-panel">
						<div className="tab-tree-panel-header">
							<span className="tab-tree-panel-title">Search results</span>
						</div>
						<SearchResults
							results={searchResults}
							windowIds={windowIds}
							onSelectTab={onSelectTab}
							onSelectWindow={handleSelectWindow}
						/>
					</div>
				) : activeWindowId ? (
					<TabTreeView
						entries={entries}
						windowId={Number(activeWindowId)}
						title={`Window ${activeIndex + 1}`}
						onSelectTab={onSelectTab}
						onDeleteTab={onDeleteTab}
						onDeleteFolder={onDeleteFolder}
						onRenameFolder={onRenameFolder}
						onCreateTab={onCreateTab}
						onCreateFolder={onCreateFolder}
						onMoveEntry={onMoveEntry}
					/>
				) : (
					<div className="app-layout-empty">No windows tracked yet.</div>
				)}
			</main>
		</div>
	);
}
