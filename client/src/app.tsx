import TabTreeView from "./features/tabs/components/TabTree";
import { useTabTree } from "./features/tabs/hooks/useTabTree";
import { useTabActions } from "./features/tabs/hooks/useTabActions";

function App() {
	const { tree, loading } = useTabTree();
	const { focusTab, deleteTab } = useTabActions();

	if (loading) {
		return <div>Loading tabs...</div>;
	}

	return (
		<TabTreeView
			tree={tree}
			onSelectTab={focusTab}
			onDeleteTab={deleteTab}
		/>
	);
}

export default App;
