import { useEffect, useRef, useState } from "react";
import "./Modal.css";

interface ModalProps {
	title: string;
	placeholder?: string;
	confirmLabel?: string;
	initialValue?: string;
	onSubmit: (value: string) => void;
	onCancel: () => void;
}

export default function Modal({
	title,
	placeholder,
	confirmLabel = "Create",
	initialValue = "",
	onSubmit,
	onCancel,
}: ModalProps) {
	const [value, setValue] = useState(initialValue);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
		inputRef.current?.select();
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancel();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onCancel]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = value.trim();
		if (trimmed) onSubmit(trimmed);
	};

	return (
		<div
			className="modal-overlay"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onCancel();
			}}
		>
			<form className="modal" onSubmit={handleSubmit}>
				<div className="modal-title">{title}</div>
				<input
					ref={inputRef}
					className="modal-input"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={placeholder}
					autoComplete="off"
					spellCheck={false}
				/>
				<div className="modal-actions">
					<button type="button" className="modal-button modal-button--secondary" onClick={onCancel}>
						Cancel
					</button>
					<button type="submit" className="modal-button modal-button--primary" disabled={!value.trim()}>
						{confirmLabel}
					</button>
				</div>
			</form>
		</div>
	);
}
