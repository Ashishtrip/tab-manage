import { createManyTabEntry, createTabEntry, upsertManyTabEntries, removeStaleTabEntries, readTabEntry } from "./tabs.repository.js"
import { readFolderEntries } from "../folders/folders.repository.js"

export const constructTree = async () => {
	const [tabs, folders] = await Promise.all([
		readTabEntry({}),
		readFolderEntries({}),
	]);
	if (!tabs) return {}

	const plainTabs = tabs.map((t) => (t.toObject ? t.toObject() : t));
	const plainFolders = (folders ?? []).map((f) => (f.toObject ? f.toObject() : f));

	// Index every node (tab or folder) by a string key so both id spaces
	// (numeric browser tab ids, ObjectId folder ids) can share one map.
	const nodeByKey = new Map();
	for (const tab of plainTabs) {
		nodeByKey.set(`tab:${tab.id}`, { ...tab, type: "tab", children: [] });
	}
	for (const folder of plainFolders) {
		nodeByKey.set(`folder:${folder._id}`, {
			...folder,
			id: folder._id.toString(),
			type: "folder",
			children: [],
		});
	}

	const tree = {};
	const ensureWindow = (windowId) => {
		if (!tree[windowId]) tree[windowId] = [];
		return tree[windowId];
	};

	// Folders nest under their parent folder, or sit at the window root.
	for (const folder of plainFolders) {
		const node = nodeByKey.get(`folder:${folder._id}`);
		const parentKey = folder.parentFolderId ? `folder:${folder.parentFolderId}` : null;
		const parent = parentKey ? nodeByKey.get(parentKey) : undefined;
		if (parent) {
			parent.children.push(node);
		} else {
			ensureWindow(folder.windowId).push(node);
		}
	}

	// Tabs nest under their folder if assigned; otherwise fall back to the
	// existing opener-based auto-tree; otherwise sit at the window root.
	for (const tab of plainTabs) {
		const node = nodeByKey.get(`tab:${tab.id}`);
		const folderKey = tab.folderId ? `folder:${tab.folderId}` : null;
		const folderParent = folderKey ? nodeByKey.get(folderKey) : undefined;

		if (folderParent) {
			folderParent.children.push(node);
			continue;
		}

		const openerParent = tab.openerTabId != null ? nodeByKey.get(`tab:${tab.openerTabId}`) : undefined;
		if (openerParent) {
			openerParent.children.push(node);
		} else {
			ensureWindow(tab.windowId).push(node);
		}
	}

	// Sort each level: folders first, then by index within each type.
	const sortLevel = (nodes) => {
		nodes.sort((a, b) => {
			if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
			return (a.index ?? 0) - (b.index ?? 0);
		});
		nodes.forEach((n) => sortLevel(n.children));
	};
	Object.values(tree).forEach(sortLevel);

	return tree; // { [windowId]: [ { ...node, type, children: [...] }, ... ] }
}

export const sync = async (arr) => {
	if (!arr || arr.length === 0) return;
	const windowIds = [...new Set(arr.map((t) => t.windowId))];
	const keepIds = arr.map((t) => t.id);
	await upsertManyTabEntries(arr);
	await removeStaleTabEntries(windowIds, keepIds);
}

// tabs.socket.js imports this name — same function as constructTree
export { constructTree as getTabsTree }
