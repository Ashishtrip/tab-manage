import { socket } from "../../../lib/socket";
import type { TabTreeNode } from "../components/TabTree";

interface CommandResponse {
	success: boolean;
	error?: string;
}

function normalizeUrl(input: string): string {
	const trimmed = input.trim();
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
		return trimmed;
	}
	return `https://${trimmed}`;
}

export function useTabActions() {
	const focusTab = (tab: TabTreeNode) => {
		socket.emit(
			"tab:requestFocus",
			{ id: tab.id, windowId: tab.windowId },
			(response: CommandResponse) => {
				if (!response?.success) {
					console.error("Failed to focus tab", response?.error);
				}
			}
		);
	};

	const deleteTab = (tab: TabTreeNode) => {
		socket.emit(
			"tab:requestDelete",
			{ id: tab.id },
			(response: CommandResponse) => {
				if (!response?.success) {
					console.error("Failed to delete tab", response?.error);
				}
			}
		);
	};

	// Note: newly created tabs always land unfiled (no folderId) — folder
	// placement isn't wired into tab *creation*, only into moving existing
	// tabs afterward (see useTreeActions).
	const createTab = (url: string) => {
		socket.emit(
			"tab:requestCreate",
			{ url: normalizeUrl(url) },
			(response: CommandResponse) => {
				if (!response?.success) {
					console.error("Failed to create tab", response?.error);
				}
			}
		);
	};

	return { focusTab, deleteTab, createTab };
}
