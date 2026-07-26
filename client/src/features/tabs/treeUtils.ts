import type { TreeEntry } from "./components/TabTree";

export function countTabs(nodes: TreeEntry[]): number {
	if (!Array.isArray(nodes)) return 0;
	return nodes.reduce(
		(sum, n) => sum + (n.type === "tab" ? 1 : 0) + countTabs(n.children ?? []),
		0
	);
}
