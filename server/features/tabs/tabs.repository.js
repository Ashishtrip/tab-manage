import Tabs from "./tabs.model.js";

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
	// TODO: This function is invoked way too many times because of how
	// onUpdated event listener works. Fix that later
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

// Upserts browser-owned fields only (index/windowId/groupId/url/title/openerTabId/status).
// Deliberately never touches folderId, so a tab's folder placement survives a resync.
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
				$setOnInsert: { id: tab.id },
			},
			upsert: true,
		},
	}));
	let status;
	try {
		status = await Tabs.bulkWrite(operations);
	} catch (error) {
		console.error(new Error("Couldn't upsert tab entries"), { cause: error });
		return;
	}
	return status;
};

// Removes tabs that are no longer open, scoped only to the windows we just
// synced — so a partial sync (e.g. currentWindow-only) never wipes out tabs
// belonging to other windows we didn't hear about this time.
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

export {
	removeTabEntry,
	updateTabEntry,
	createTabEntry,
	readTabEntry,
	deleteAllTabEntries,
	createManyTabEntry,
	upsertManyTabEntries,
	removeStaleTabEntries
}
