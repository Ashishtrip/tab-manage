import { useEffect, useRef } from "react";
import "./ContextMenu.css";

export interface ContextMenuItem {
	label: string;
	onSelect: () => void;
}

interface ContextMenuProps {
	x: number;
	y: number;
	items: ContextMenuItem[];
	onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handlePointerDown = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose();
			}
		};
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [onClose]);

	return (
		<div ref={ref} className="context-menu" style={{ top: y, left: x }}>
			{items.map((item) => (
				<button
					key={item.label}
					type="button"
					className="context-menu-item"
					onClick={() => {
						item.onSelect();
						onClose();
					}}
				>
					{item.label}
				</button>
			))}
		</div>
	);
}
