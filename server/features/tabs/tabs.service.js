import { createManyTabEntry, createTabEntry, deleteAllTabEntries, readTabEntry } from "./tabs.repository.js"

export const constructTree = async () => {
	const tabs = await readTabEntry({})
	if (!tabs) return {}

	// Index every tab by its id for O(1) parent lookups
	const nodeById = new Map();
	for (const tab of tabs) {
		nodeById.set(tab.id, { ...(tab.toObject ? tab.toObject() : tab), children: [] });
	}

	// windowId -> array of root nodes (tabs with no valid opener in this data set)
	const tree = {};

	for (const tab of tabs) {
		const node = nodeById.get(tab.id);
		const windowId = tab.windowId;

		if (!tree[windowId]) {
			tree[windowId] = [];
		}

		const parent = tab.openerTabId != null ? nodeById.get(tab.openerTabId) : undefined;

		if (parent) {
			parent.children.push(node);
		} else {
			// No opener, or opener not present in DB (e.g. already closed) -> treat as root
			tree[windowId].push(node);
		}
	}

	// Sort each level by `index` so it matches actual tab order
	const sortByIndex = (nodes) => {
		nodes.sort((a, b) => a.index - b.index);
		nodes.forEach((n) => sortByIndex(n.children));
	};
	Object.values(tree).forEach(sortByIndex);

	return tree; // { [windowId]: [ { ...tab, children: [...] }, ... ] }
}

export const sync = async (arr) => {
	await deleteAllTabEntries()
	await createManyTabEntry(arr)
}

// tabs.socket.js imports this name — same function as constructTree
export { constructTree as getTabsTree }
