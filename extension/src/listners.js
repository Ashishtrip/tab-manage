import socket from "./socket.js"
import {
	tabDeletedHandler,
	tabUpdatedHandler,
	tabCreatedHandler,
	tabDeleteHandler,
	tabCreateHandler,
	tabFocusHandler,
	getAllTabs
} from "./handlers.js";

const tabCreatedListener = () => {
	browser.tabs.onCreated.addListener(tabCreatedHandler)
}

const tabRemovedListener = () => {
	browser.tabs.onRemoved.addListener(tabDeletedHandler);
}

const tabUpdatedListener = () => {
	browser.tabs.onUpdated.addListener(tabUpdatedHandler, { properties: ["title", "url", "status", "groupId"] });
}

const tabDeleteListner = () => {
	socket.on("command:delete", tabDeleteHandler )
}

const tabCreateListner = () => {
	socket.on("command:create", tabCreateHandler)
}

const tabFocusListner = () => {
	socket.on("command:focus", tabFocusHandler)
}

const onInstall = () => {
	browser.runtime.onInstalled.addListener(getAllTabs);
}

const onStartup = () => {
	browser.runtime.onStartup.addListener(() => {
		getAllTabs();
	});
}

const start = () => {
	onStartup()
	onInstall()
	tabCreatedListener()
	tabUpdatedListener()
	tabRemovedListener()
	tabDeleteListner()
	tabCreateListner()
	tabFocusListner()
}

export {
	start as main
}
