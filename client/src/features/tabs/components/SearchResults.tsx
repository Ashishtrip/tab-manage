import type { TreeEntry, TabTreeNode, TabTree } from "./TabTree";
import "./SearchResults.css";

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
		<svg className="tab-tree-folder-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
			<path
				d="M3 7.4C3 6.07 4.07 5 5.4 5h4.1l1.9 2.1h8.2c1.33 0 2.4 1.07 2.4 2.4v7.1c0 1.33-1.07 2.4-2.4 2.4H5.4C4.07 18.9 3 17.83 3 16.5V7.4Z"
				fill="currentColor"
			/>
		</svg>
	);
}

interface SearchResultsProps {
	results: TreeEntry[];
	windowIds: string[];
	onSelectTab?: (tab: TabTreeNode) => void;
	onSelectWindow: (windowId: string) => void;
}

export default function SearchResults({ results, windowIds, onSelectTab, onSelectWindow }: SearchResultsProps) {
	if (results.length === 0) {
		return <div className="search-results-empty">No matches.</div>;
	}

	return (
		<div className="search-results">
			{results.map((entry) => {
				const windowLabel = `Window ${windowIds.indexOf(String(entry.windowId)) + 1}`;
				const isFolder = entry.type === "folder";
				const favicon = !isFolder ? faviconUrl(entry.url) : null;

				const handleClick = () => {
					onSelectWindow(String(entry.windowId));
					if (!isFolder) onSelectTab?.(entry);
				};

				return (
					<div key={`${entry.type}:${entry.id}`} className="search-result-row" onClick={handleClick}>
						{isFolder ? (
							<FolderIcon />
						) : favicon ? (
							<img src={favicon} alt="" className="search-result-favicon" />
						) : (
							<span className="search-result-favicon search-result-favicon--placeholder" />
						)}
						<span className="search-result-title">{isFolder ? entry.name : entry.title || entry.url}</span>
						<span className="search-result-window">{windowLabel}</span>
					</div>
				);
			})}
		</div>
	);
}
