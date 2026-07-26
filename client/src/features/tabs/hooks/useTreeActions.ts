import { socket } from "../../../lib/socket";
import type { MoveEntryPayload } from "../components/TabTree";

interface CommandResponse {
	success: boolean;
	error?: string;
}

export function useTreeActions() {
	const moveEntry = (move: MoveEntryPayload) => {
		socket.emit(
			"tree:move",
			move,
			(response: CommandResponse) => {
				if (!response?.success) {
					console.error("Failed to move entry", response?.error);
				}
			}
		);
	};

	return { moveEntry };
}
