import { getAllTabs } from "./manageTab.js";
const PORT = 3000
const tabCreatedListener = () => {
	browser.tabs.onCreated.addListener(async (tab) => {
		try {
			const response = await fetch(`http://localhost:${PORT}/api/tabs`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: tab.id,
					index: tab.index,
					windowId: tab.windowId,
					groupId: tab.groupId,
					url: tab.url,
					title: tab.title,
					openerTabId: tab.openerTabId,
					status: tab.status,
				})
			})
			if (!response.ok) {
				console.error(new Error("Server rejected tab create request"), { cause: await response.text() });
			}
		} catch (error) {
			console.error(new Error("Couldn't send onCreated event", { cause: error }))
		}
	});
}
const tabRemovedListener = () => {
	browser.tabs.onRemoved.addListener(async (tabId) => {
		try {
			const response = await fetch(`http://localhost:${PORT}/api/tabs/${tabId}`, {
				method: 'DELETE',
			})
			if (!response.ok) {
				console.error(new Error("Server rejected tab removed request"), { cause: await response.text() });
			}
		} catch (error) {
			console.error(new Error("Couldn't send onUpdated event"), { cause: error });
		}
	});
}

const tabUpdatedListener = () => {
	browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
		try {
			const response = await fetch(`http://localhost:${PORT}/api/tabs/${tabId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(changeInfo)
			});
			if (!response.ok) {
				console.error(new Error("Server rejected tab update request"), { cause: await response.text() });
			}
		} catch (error) {
			console.error(new Error("Couldn't send onUpdated event"), { cause: error });
		}
	},
		{ properties: ["title", "url", "status", "groupId"] }
	);
};

const onInstall = () => {
	browser.runtime.onInstalled.addListener(() => {
		getAllTabs(PORT);
	});
}
const onStartup = () => {
	browser.runtime.onStartup.addListener(() => {
		getAllTabs(PORT);
	});
}
export {
	tabCreatedListener,
	tabRemovedListener,
	tabUpdatedListener,
	onStartup,
	onInstall
}
