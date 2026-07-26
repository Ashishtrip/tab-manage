import type { TreeEntry, TabTree } from "./components/TabTree";

export function countTabs(nodes: TreeEntry[]): number {
	if (!Array.isArray(nodes)) return 0;
	return nodes.reduce(
		(sum, n) => sum + (n.type === "tab" ? 1 : 0) + countTabs(n.children ?? []),
		0
	);
}

// Flat, recursive search across every window — matches tab title/url or
// folder name, case-insensitive substring match.
export function searchTree(tree: TabTree, query: string): TreeEntry[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];

	const results: TreeEntry[] = [];
	const walk = (nodes: TreeEntry[]) => {
		for (const node of nodes) {
			const haystack = node.type === "folder" ? node.name : `${node.title} ${node.url}`;
			if (haystack.toLowerCase().includes(q)) {
				results.push(node);
			}
			walk(node.children);
		}
	};

	Object.values(tree).forEach(walk);
	return results;
}
