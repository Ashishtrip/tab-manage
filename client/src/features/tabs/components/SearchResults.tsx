import type { TreeEntry, TabTreeNode } from "./TabTree";
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
		<svg className="tab-tree-folder-icon" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
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
