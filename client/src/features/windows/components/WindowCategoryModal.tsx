import "./WindowCategoryModal.css";

interface WindowCategoryModalProps {
	windowId: string;
	onSubmit: (category: string) => void;
}

export default function WindowCategoryModal({ windowId, onSubmit }: WindowCategoryModalProps) {
	const categories = ["Work", "Personal", "Dev", "Research"];

	return (
		<div className="window-category-overlay">
			<div className="window-category-modal">
				<h2>Categorize Window {windowId}</h2>
				<p>Select a category for your new window</p>
				<div className="category-buttons">
					{categories.map((cat) => (
						<button
							key={cat}
							className="category-button"
							onClick={() => onSubmit(cat)}
						>
							{cat}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
