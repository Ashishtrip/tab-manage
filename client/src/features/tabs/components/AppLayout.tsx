import { useEffect, useState } from "react";
import WindowSidebar from "../../windows/components/WindowSidebar";
import TabTreeView, {
	type TabTree,
	type TabTreeNode,
	type FolderTreeNode,
	type CreationContext,
} from "./TabTree";
import "../../../styles/theme.css";
import "./AppLayout.css";

interface AppLayoutProps {
	tree: TabTree;
	onSelectTab?: (tab: TabTreeNode) => void;
	onDeleteTab?: (tab: TabTreeNode) => void;
	onDeleteFolder?: (folder: FolderTreeNode) => void;
	onCreateTab?: (context: CreationContext, url: string) => void;
	onCreateFolder?: (context: CreationContext, name: string) => void;
}

export default function AppLayout({
	tree,
	onSelectTab,
	onDeleteTab,
	onDeleteFolder,
	onCreateTab,
	onCreateFolder,
}: AppLayoutProps) {
	const windowIds = Object.keys(tree);
	const [activeWindowId, setActiveWindowId] = useState<string | null>(windowIds[0] ?? null);

	// Keep the selection valid as windows open/close (e.g. the active
	// window was just closed, or this is the very first tree we've loaded).
	useEffect(() => {
		if (activeWindowId && windowIds.includes(activeWindowId)) return;
		setActiveWindowId(windowIds[0] ?? null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [windowIds.join(",")]);

	const activeIndex = activeWindowId ? windowIds.indexOf(activeWindowId) : -1;
	const entries = activeWindowId ? tree[activeWindowId] ?? [] : [];

	return (
		<div className="app-layout">
			<WindowSidebar
				tree={tree}
				activeWindowId={activeWindowId}
				onSelectWindow={setActiveWindowId}
			/>
			<div className="app-layout-divider" />
			<main className="app-layout-main">
				{activeWindowId ? (
					<TabTreeView
						entries={entries}
						windowId={Number(activeWindowId)}
						title={`Window ${activeIndex + 1}`}
						onSelectTab={onSelectTab}
						onDeleteTab={onDeleteTab}
						onDeleteFolder={onDeleteFolder}
						onCreateTab={onCreateTab}
						onCreateFolder={onCreateFolder}
					/>
				) : (
					<div className="app-layout-empty">No windows tracked yet.</div>
				)}
			</main>
		</div>
	);
}
