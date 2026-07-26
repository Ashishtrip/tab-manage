import type { TabTree } from "../../tabs/components/TabTree";
import "./WindowSidebar.css";

interface WindowSidebarProps {
	tree: TabTree;
	activeWindowId: string | null;
	onSelectWindow: (windowId: string) => void;
}

function WindowIcon() {
	return (
		<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
			<rect x="2.5" y="3.5" width="15" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
			<line x1="2.5" y1="7" x2="17.5" y2="7" stroke="currentColor" strokeWidth="1.3" />
		</svg>
	);
}

export default function WindowSidebar({ tree, activeWindowId, onSelectWindow }: WindowSidebarProps) {
	const windowIds = Object.keys(tree);

	return (
		<nav className="window-sidebar" aria-label="Windows">
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
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}
