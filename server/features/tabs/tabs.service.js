import { createManyTabEntry, createTabEntry, upsertManyTabEntries, removeStaleTabEntries, readTabEntry, moveTabEntry } from "./tabs.repository.js"
import { readFolderEntries, moveFolderEntry } from "../folders/folders.repository.js"

export const constructTree = async () => {
	const [tabs, folders] = await Promise.all([
		readTabEntry({}),
		readFolderEntries({}),
	]);
	if (!tabs) return {}

	const plainTabs = tabs.map((t) => (t.toObject ? t.toObject() : t));
	const plainFolders = (folders ?? []).map((f) => (f.toObject ? f.toObject() : f));

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

	// Sort each level purely by manual `order` — mixes tabs and folders
	// freely, so drag-and-drop arrangement is respected everywhere.
	const sortLevel = (nodes) => {
		nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		nodes.forEach((n) => sortLevel(n.children));
	};
	Object.values(tree).forEach(sortLevel);

	return tree;
}

export const sync = async (arr) => {
	if (!arr || arr.length === 0) return;
	const windowIds = [...new Set(arr.map((t) => t.windowId))];
	const keepIds = arr.map((t) => t.id);
	await upsertManyTabEntries(arr);
	await removeStaleTabEntries(windowIds, keepIds);
}

// Generic drag-and-drop move for either a tab or a folder.
export const moveEntry = async ({ id, kind, order, folderId, parentFolderId }) => {
	if (kind === "tab") {
		return moveTabEntry({ id, order, folderId });
	}
	if (kind === "folder") {
		return moveFolderEntry({ id, order, parentFolderId });
	}
	throw new Error(`Unknown entry kind: ${kind}`);
}

// tabs.socket.js imports this name — same function as constructTree
export { constructTree as getTabsTree }
