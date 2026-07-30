import { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";

export function useWindows() {
	const [categories, setCategories] = useState<Record<string, string>>({});

	useEffect(() => {
		const fetchWindows = () => {
			socket.emit("windows:get", null, (response: { success: boolean; data?: Record<string, string> }) => {
				if (response.success && response.data) {
					setCategories(response.data);
				}
			});
		};

		fetchWindows();
		socket.on("windows:updated", (data: Record<string, string>) => {
			setCategories(data);
		});
		socket.on("connect", fetchWindows);

		return () => {
			socket.off("windows:updated");
			socket.off("connect", fetchWindows);
		};
	}, []);

	const setCategory = (windowId: string, category: string) => {
		socket.emit("windows:setCategory", { windowId, category });
	};

	return { categories, setCategory };
}
