import { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";
import type { TabTree } from "../components/TabTree";

interface TreeResponse {
	success: boolean;
	data?: TabTree;
	error?: string;
}

export function useTabTree() {
	const [tree, setTree] = useState<TabTree>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTree = () => {
			socket.emit("tree:get", null, (response: TreeResponse) => {
				if (response.success && response.data) {
					setTree(response.data);
				} else {
					console.error("Failed to fetch tab tree", response.error);
				}
				setLoading(false);
			});
		};

		fetchTree(); // initial load on mount

		socket.on("tree:updated", fetchTree); // re-fetch whenever the server broadcasts a change
		socket.on("connect", fetchTree); // also re-fetch on (re)connect, e.g. after a server restart

		return () => {
			socket.off("tree:updated", fetchTree);
			socket.off("connect", fetchTree);
		};
	}, []);

	return { tree, loading };
}
