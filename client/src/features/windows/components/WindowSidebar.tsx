import type { TabTree } from "../../tabs/components/TabTree";
import { countTabs } from "../../tabs/treeUtils";
import "./WindowSidebar.css";

interface WindowSidebarProps {
	tree: TabTree;
	activeWindowId: string | null;
	onSelectWindow: (windowId: string) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

function WindowIcon() {
	return (
		<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
			<rect x="2.5" y="3.5" width="15" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
			<line x1="2.5" y1="7" x2="17.5" y2="7" stroke="currentColor" strokeWidth="1.3" />
		</svg>
	);
}

function SearchIcon() {
	return (
		<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
			<circle cx="7" cy="7" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
			<line x1="10.3" y1="10.3" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
		</svg>
	);
}

export default function WindowSidebar({
	tree,
	activeWindowId,
	onSelectWindow,
	searchQuery,
	onSearchChange,
}: WindowSidebarProps) {
	const windowIds = Object.keys(tree);

	return (
		<nav className="window-sidebar" aria-label="Windows">
			<div className="window-sidebar-search">
				<SearchIcon />
				<input
					type="text"
					className="window-sidebar-search-input"
					placeholder="Search tabs and windows..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>

			<div className="window-sidebar-header">Windows</div>
			<ul className="window-list">
				{windowIds.map((windowId, i) => (
					<li key={windowId}>
						<button
							type="button"
							className={`window-item${windowId === activeWindowId ? " window-item--active" : ""}`}
							onClick={() => onSelectWindow(windowId)}
						>
							<WindowIcon />
							<span className="window-item-label">Window {i + 1}</span>
							<span className="window-item-count">{countTabs(tree[windowId])}</span>
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}
