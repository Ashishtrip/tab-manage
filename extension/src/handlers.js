import socket from "./socket.js";
const TIMEOUT = 5000;

function normalizeUrl(input) {
	const trimmed = input.trim();
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
		return trimmed;
	}
	return `https://${trimmed}`;
}

async function tabCreatedHandler(tab) {
	try {
		socket.timeout(TIMEOUT).emit(
			"tab:created",
			{
				id: tab.id,
				index: tab.index,
				windowId: tab.windowId,
				groupId: tab.groupId,
				url: tab.url,
				title: tab.title,
				openerTabId: tab.openerTabId,
				status: tab.status,
			},
			(error, response) => {
				if (error) {
					console.error(new Error("Server didn't acknowledge tab create"), { cause: error });
				} else if (!response.success) {
					console.error(new Error("Server rejected tab create request"), { cause: response.error });
				}
			});
	} catch (error) {
		console.error(new Error("Couldn't send tab:created event"), { cause: error });
	}
}


async function tabUpdatedHandler(tabId, changeInfo) {
	try {
		socket.timeout(TIMEOUT).emit(
			"tab:updated",
			{ id: tabId, changeInfo: changeInfo },
			(error, response) => {
				if (error) {
					console.error(new Error("Server didn't acknowledge tab updated"), { cause: error });
				} else if (!response.success) {
					console.error(new Error("Server rejected tab update request"), { cause: response.error });
				}
			})
	} catch (error) {
		console.error(new Error("Couldn't send tap:updated event"), { cause: error });
	}
}

async function tabDeletedHandler(tabId) {
	try {
		socket.timeout(TIMEOUT).emit(
			"tab:deleted",
			{ id: tabId, },
			(error, response) => {
				if (error) {
					console.error(new Error("Server didn't acknowledge tab delete"), { cause: error });
				} else if (!response.success) {
					console.error(new Error("Server rejected tab delete request"), { cause: response.error });
				}
			})
	} catch (error) {
		console.error(new Error("Couldn't send tab:deleted event"), { cause: error });
	}
}


async function tabDeleteHandler(payload) {
	try {
		await browser.tabs.remove(payload.tabId);
	} catch (error) {
		console.error(new Error("Failed to execute delete command"), { cause: error });
	}
}

async function tabCreateHandler(payload) {
	try {
		await browser.tabs.create({ url: normalizeUrl(payload.url) });
	} catch (error) {
		console.error(new Error("Failed to execute create command"), { cause: error });
	}
}

async function tabFocusHandler(payload) {
	try {
		await browser.tabs.update(payload.tabId, { active: true });
		if (payload.windowId != null) {
			await browser.windows.update(payload.windowId, { focused: true });
		}
	} catch (error) {
		console.error(new Error("Failed to execute focus command"), { cause: error });
	}
}

async function getAllTabs() {
	try {
		const output = await browser.tabs.query( { currentWindow: true })
		socket.timeout(TIMEOUT).emit(
			"tabs:sync",
			output,
			(error, response) => {
				if (error) {
					console.error(new Error("Server didn't acknowledge tab sync"), { cause: error });
				} else if (!response.success) {
					console.error(new Error("Server rejected tab sync request"), { cause: response.error });
				}
			}
		)
	} catch (error) {
		console.error(new Error("Couldn't sync tab", { cause: error }))
		return -1
	}
}

export {
	tabCreatedHandler,
	tabUpdatedHandler,
	tabDeletedHandler,
	tabDeleteHandler,
	tabCreateHandler,
	tabFocusHandler,
	getAllTabs
}
