import { useEffect, useState } from "react";
import WindowSidebar from "../../windows/components/WindowSidebar";
import SearchResults from "./SearchResults";
import Modal from "./Modal";
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

function SearchIcon() {
	return (
		<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
			<circle cx="7" cy="7" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
			<line x1="10.3" y1="10.3" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
		</svg>
	);
}

function NewFolderIcon() {
	return (
		<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
			<path
				d="M2.5 5.3c0-.83.67-1.5 1.5-1.5h3.6l1.6 1.8H16c.83 0 1.5.67 1.5 1.5v6.6c0 .83-.67 1.5-1.5 1.5H4c-.83 0-1.5-.67-1.5-1.5V5.3Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.4"
				strokeLinejoin="round"
			/>
			<path d="M10 8.2V11.8M8.2 10H11.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
		</svg>
	);
}

function FilterIcon() {
	return (
		<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
			<line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
			<line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
			<line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
			<circle cx="7" cy="6" r="1.6" fill="var(--panel-bg)" stroke="currentColor" strokeWidth="1.2" />
			<circle cx="13" cy="10" r="1.6" fill="var(--panel-bg)" stroke="currentColor" strokeWidth="1.2" />
			<circle cx="9" cy="14" r="1.6" fill="var(--panel-bg)" stroke="currentColor" strokeWidth="1.2" />
		</svg>
	);
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
	const [showNewFolderModal, setShowNewFolderModal] = useState(false);

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
			<WindowSidebar tree={tree} activeWindowId={activeWindowId} onSelectWindow={handleSelectWindow} />
			<div className="app-layout-divider" />
			<main className="app-layout-main">
				<div className="app-top-bar">
					<div className="app-search-box">
						<SearchIcon />
						<input
							type="text"
							className="app-search-input"
							placeholder="Search tabs..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						type="button"
						className="app-new-folder-button"
						onClick={() => setShowNewFolderModal(true)}
						disabled={activeWindowId === null}
					>
						<NewFolderIcon />
						New folder
					</button>
					<button type="button" className="app-icon-button" title="Filter">
						<FilterIcon />
					</button>
				</div>

				{isSearching ? (
					<SearchResults
						results={searchResults}
						windowIds={windowIds}
						onSelectTab={onSelectTab}
						onSelectWindow={handleSelectWindow}
					/>
				) : activeWindowId ? (
					<TabTreeView
						entries={entries}
						windowId={Number(activeWindowId)}
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

			{showNewFolderModal && activeWindowId && (
				<Modal
					title="New folder"
					placeholder="Folder name"
					confirmLabel="Create"
					onSubmit={(name) => {
						onCreateFolder?.({ windowId: Number(activeWindowId), parentFolderId: null }, name);
						setShowNewFolderModal(false);
					}}
					onCancel={() => setShowNewFolderModal(false)}
				/>
			)}
		</div>
	);
}
