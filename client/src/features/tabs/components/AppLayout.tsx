import { useEffect, useState } from "react";
import WindowSidebar from "../../windows/components/WindowSidebar";
import WindowCategoryModal from "../../windows/components/WindowCategoryModal";
import { useWindows } from "../../windows/hooks/useWindows";
import SearchResults from "./SearchResults";
import Modal from "./Modal";
import CommandCenter from "../../search/components/CommandCenter";
import SemanticDiscovery from "../../search/components/SemanticDiscovery";

import ActiveTabs from "./views/ActiveTabs";
import ArchivedTabs from "./views/ArchivedTabs";
import AIClusters from "./views/AIClusters";
import Handoff from "./views/Handoff";
import SmartWorkspace from "./views/SmartWorkspace";

import MindMap from "./MindMap";
import ThemeToggle from "../../../components/ThemeToggle";
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

type ViewMode = "tree" | "mindmap" | "semantic" | "active" | "archived" | "clusters" | "handoff" | "workspace";

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

function ListViewIcon() {
	return (
		<svg viewBox="0 0 18 18" width="15" height="15" aria-hidden="true">
			<circle cx="3" cy="4.5" r="1.1" fill="currentColor" />
			<circle cx="3" cy="9" r="1.1" fill="currentColor" />
			<circle cx="3" cy="13.5" r="1.1" fill="currentColor" />
			<line x1="6.4" y1="4.5" x2="15" y2="4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
			<line x1="6.4" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
			<line x1="6.4" y1="13.5" x2="15" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
		</svg>
	);
}

function MindMapViewIcon() {
	return (
		<svg viewBox="0 0 18 18" width="15" height="15" aria-hidden="true">
			<circle cx="9" cy="9" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
			<circle cx="3" cy="3.5" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
			<circle cx="15" cy="3.5" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
			<circle cx="3" cy="14.5" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
			<circle cx="15" cy="14.5" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
			<line x1="7.6" y1="7.7" x2="4.1" y2="4.5" stroke="currentColor" strokeWidth="1.2" />
			<line x1="10.4" y1="7.7" x2="13.9" y2="4.5" stroke="currentColor" strokeWidth="1.2" />
			<line x1="7.6" y1="10.3" x2="4.1" y2="13.5" stroke="currentColor" strokeWidth="1.2" />
			<line x1="10.4" y1="10.3" x2="13.9" y2="13.5" stroke="currentColor" strokeWidth="1.2" />
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
	const [viewMode, setViewMode] = useState<ViewMode>("workspace");
	const [isSidebarLocked, setIsSidebarLocked] = useState(false);
	const [isSidebarHovered, setIsSidebarHovered] = useState(false);
	const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);

	const { categories, setCategory } = useWindows();

	// Find the first uncategorized window to prompt the user
	const uncategorizedWindowId = windowIds.find((id) => !categories[id]);

	useEffect(() => {
		if (activeWindowId && windowIds.includes(activeWindowId)) return;
		setActiveWindowId(windowIds[0] ?? null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [windowIds.join(",")]);

	const entries = activeWindowId ? tree[activeWindowId] ?? [] : [];
	const isSearching = searchQuery.trim().length > 0;
	const searchResults = isSearching ? searchTree(tree, searchQuery) : [];

	const handleSelectWindow = (windowId: string) => {
		setActiveWindowId(windowId);
		setSearchQuery("");
	};

	return (
		<div className="app-layout">
			<div 
				className={`sidebar-wrapper ${isSidebarLocked ? "locked" : "floating"} ${isSidebarHovered ? "hovered" : ""}`}
				onMouseEnter={() => !isSidebarLocked && setIsSidebarHovered(true)}
				onMouseLeave={() => !isSidebarLocked && setIsSidebarHovered(false)}
			>
				{!isSidebarLocked && !isSidebarHovered && <div className="sidebar-trigger-zone" />}
				<WindowSidebar 
					tree={tree} 
					activeWindowId={activeWindowId} 
					onSelectWindow={handleSelectWindow} 
					categories={categories}
					isLocked={isSidebarLocked}
					onToggleLock={() => setIsSidebarLocked(!isSidebarLocked)}
				/>
			</div>
			<main className="app-layout-main">
				<div className="app-top-bar">
					<div className="app-search-box" onClick={() => setIsCommandCenterOpen(true)} style={{ cursor: 'pointer' }}>
						<SearchIcon />
						<input
							type="text"
							className="app-search-input"
							placeholder="Search tabs or Cmd+K..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							style={{ pointerEvents: 'none' }}
						/>
					</div>
					<div className="app-view-toggle" role="group" aria-label="View mode">
						<button
							type="button"
							className={`app-view-toggle-button${viewMode === "tree" ? " app-view-toggle-button--active" : ""}`}
							onClick={() => setViewMode("tree")}
							disabled={isSearching}
							title="List view"
						>
							<ListViewIcon />
						</button>
						<button
							type="button"
							className={`app-view-toggle-button${viewMode === "mindmap" ? " app-view-toggle-button--active" : ""}`}
							onClick={() => setViewMode("mindmap")}
							disabled={isSearching}
							title="Mind map view"
						>
							<MindMapViewIcon />
						</button>
						<div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
						<button
							type="button"
							className={`app-view-toggle-button${viewMode === "workspace" ? " app-view-toggle-button--active" : ""}`}
							onClick={() => setViewMode("workspace")}
							disabled={isSearching}
							title="Smart Workspace"
						>
							<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
						</button>
						<button
							type="button"
							className={`app-view-toggle-button${viewMode === "active" ? " app-view-toggle-button--active" : ""}`}
							onClick={() => setViewMode("active")}
							disabled={isSearching}
							title="Active Tabs"
						>
							<ListViewIcon />
						</button>
						<button
							type="button"
							className={`app-view-toggle-button${viewMode === "archived" ? " app-view-toggle-button--active" : ""}`}
							onClick={() => setViewMode("archived")}
							disabled={isSearching}
							title="Archived Tabs"
						>
							<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
						</button>
						<button
							type="button"
							className={`app-view-toggle-button${viewMode === "clusters" ? " app-view-toggle-button--active" : ""}`}
							onClick={() => setViewMode("clusters")}
							disabled={isSearching}
							title="AI Clusters"
						>
							<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
						</button>
						<button
							type="button"
							className={`app-view-toggle-button${viewMode === "handoff" ? " app-view-toggle-button--active" : ""}`}
							onClick={() => setViewMode("handoff")}
							disabled={isSearching}
							title="Handoff"
						>
							<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
						</button>
						<button
							type="button"
							className={`app-view-toggle-button${viewMode === "semantic" ? " app-view-toggle-button--active" : ""}`}
							onClick={() => setViewMode("semantic")}
							disabled={isSearching}
							title="Semantic Discovery"
							style={{ padding: '0 8px', fontSize: '12px', fontWeight: 500 }}
						>
							✨ AI
						</button>
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
				) : viewMode === "workspace" ? (
					<SmartWorkspace />
				) : viewMode === "active" ? (
					<ActiveTabs entries={entries} onSelectTab={onSelectTab} />
				) : viewMode === "archived" ? (
					<ArchivedTabs />
				) : viewMode === "clusters" ? (
					<AIClusters />
				) : viewMode === "handoff" ? (
					<Handoff />
				) : viewMode === "semantic" ? (
					<div style={{ flex: 1, padding: '24px', height: '100%' }}>
						<SemanticDiscovery />
					</div>
				) : activeWindowId && viewMode === "mindmap" ? (
					<MindMap
						entries={entries}
						windowId={Number(activeWindowId)}
						onSelectTab={onSelectTab}
						onDeleteTab={onDeleteTab}
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
			{uncategorizedWindowId && (
				<WindowCategoryModal
					windowId={uncategorizedWindowId}
					onSubmit={(category) => {
						setCategory(uncategorizedWindowId, category);
					}}
				/>
			)}
			<ThemeToggle />
			<CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} />
		</div>
	);
}
