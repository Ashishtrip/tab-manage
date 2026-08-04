import Tabs from "./tabs.model.js";
import { addTabToQueue } from "../../config/queue.js";

const createTabEntry = async (tabObj) => {
	let status;
	try {
		status = await new Tabs(tabObj).save();
	} catch (error) {
		console.error(new Error("Couldn't insert tab entry"), { cause: error });
		return;
	}
	if (!status?._id) {
		console.warn("Couldn't insert tab entry", tabObj.id);
	} else {
		// Enqueue for AI processing
		addTabToQueue(status).catch(err => console.error("Error adding tab to queue", err));
	}
};

const createManyTabEntry = async (arr) => {
	if (arr.length === 0) {
		return 0
	}
	for (let entry of arr) {
		createTabEntry(entry)
	}
};

const updateTabEntry = async (updatedInfo) => {
	let status;
	try {
		status = await Tabs.updateOne(
			{ id: updatedInfo.id },
			updatedInfo.changeInfo
		);
	} catch (error) {
		console.error(new Error("Couldn't update tab entry"), { cause: error });
		return;
	}
	if (status.acknowledged) {
		if (status.matchedCount === 0) {
			console.warn("Couldn't update, no match found", updatedInfo.id);
		} else if (!status.modifiedCount === 1) {
			console.warn("Tab entry didn't update", updatedInfo.id);
		}
	}
};

const removeTabEntry = async (removeInfo) => {
	let status;
	try {
		status = await Tabs.deleteOne({ id: removeInfo.id });
	} catch (error) {
		console.error(new Error("Couldn't remove tab entry"), { cause: error });
		return;
	}
	if (!(status.acknowledged && status.deletedCount === 1)) {
		console.warn("No tab entry was found for", removeInfo.id);
	}
};

const readTabEntry = async (searchCondition) => {
	let output;
	try {
		output = await Tabs.find(searchCondition)
	} catch (error) {
		console.error(new Error("Couldn't read tab entries"), { cause: error });
		return;
	}
	return output
};

const deleteAllTabEntries = async () => {
	let status;
	try {
		status = await Tabs.deleteMany({});
	} catch (error) {
		console.error(new Error("Couldn't delete table entries"), { cause: error });
		return;
	}
	if ( !(status.acknowledged && status.deletedCount > 0) ) {
		console.warn("tab-info table is already empty");
	}
};

// Upserts browser-owned fields only. Deliberately never touches folderId
// or order, so folder placement and manual arrangement survive a resync.
// On first insert, order defaults to the browser's own tab-strip position
// so a freshly-synced tree still looks sensible before anyone rearranges it.
const upsertManyTabEntries = async (arr) => {
	if (!arr || arr.length === 0) {
		return;
	}
	const operations = arr.map((tab) => ({
		updateOne: {
			filter: { id: tab.id },
			update: {
				$set: {
					index: tab.index,
					windowId: tab.windowId,
					groupId: tab.groupId,
					url: tab.url,
					title: tab.title,
					openerTabId: tab.openerTabId,
					status: tab.status,
				},
				$setOnInsert: { id: tab.id, order: tab.index },
			},
			upsert: true,
		},
	}));
	try {
		status = await Tabs.bulkWrite(operations);
		
		// For newly inserted tabs or all tabs, let's just queue the ones that were inserted or updated.
		// Since bulkWrite doesn't return the full documents easily, we can find the ones we just touched
		const updatedIds = arr.map(t => t.id);
		const updatedDocs = await Tabs.find({ id: { $in: updatedIds } });
		for (const doc of updatedDocs) {
			if (!doc.embedding || doc.embedding.length === 0) {
				addTabToQueue(doc).catch(err => console.error("Error adding tab to queue", err));
			}
		}
	} catch (error) {
		console.error(new Error("Couldn't upsert tab entries"), { cause: error });
		return;
	}
	return status;
};

const removeStaleTabEntries = async (windowIds, keepIds) => {
	let status;
	try {
		status = await Tabs.deleteMany({
			windowId: { $in: windowIds },
			id: { $nin: keepIds },
		});
	} catch (error) {
		console.error(new Error("Couldn't remove stale tab entries"), { cause: error });
		return;
	}
	return status;
};

// Single-item drag-and-drop move: updates this tab's manual order and,
// if it changed folders, its folderId.
const moveTabEntry = async ({ id, order, folderId }) => {
	let status;
	try {
		status = await Tabs.updateOne(
			{ id },
			{ $set: { order, folderId: folderId ?? null } }
		);
	} catch (error) {
		console.error(new Error("Couldn't move tab entry"), { cause: error });
		return;
	}
	return status;
};

export {
	removeTabEntry,
	updateTabEntry,
	createTabEntry,
	readTabEntry,
	deleteAllTabEntries,
	createManyTabEntry,
	upsertManyTabEntries,
	removeStaleTabEntries,
	moveTabEntry
}
