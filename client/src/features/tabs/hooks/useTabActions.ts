import { socket } from "../../../lib/socket";
import type { TabTreeNode } from "../components/TabTree";

interface CommandResponse {
	success: boolean;
	error?: string;
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

	// Note: newly created tabs always land unfiled (no folderId) — the
	// extension creates a real browser tab, and folder placement isn't
	// wired into that flow yet.
	const createTab = (url: string) => {
		socket.emit(
			"tab:requestCreate",
			{ url },
			(response: CommandResponse) => {
				if (!response?.success) {
					console.error("Failed to create tab", response?.error);
				}
			}
		);
	};

	return { focusTab, deleteTab, createTab };
}
