import { createManyTabEntry, createTabEntry, deleteAllTabEntries, readTabEntry } from "./tabs.repository.js"
import Tabs  from './tabs.model.js'


export const getTabsTree = async () => {
	let tabs;
	try {
		tabs = await Tabs.find({}).lean();
	} catch (error) {
		console.error(new Error("Couldn't read tab entries for tree"), { cause: error });
		return;
	}

	const nodeById = new Map();
	for (const tab of tabs) {
		nodeById.set(tab.id, { ...tab, children: [] });
	}

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
			tree[windowId].push(node);
		}
	}

	const sortByIndex = (nodes) => {
		nodes.sort((a, b) => a.index - b.index);
		nodes.forEach((n) => sortByIndex(n.children));
	};
	Object.values(tree).forEach(sortByIndex);

	return tree;
};

export const sync = async (arr) => {
	await deleteAllTabEntries()
	await createManyTabEntry(arr)
}

