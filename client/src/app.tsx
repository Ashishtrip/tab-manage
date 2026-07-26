import TabTreeView from "./features/tabs/components/TabTree";
import { useTabTree } from "./features/tabs/hooks/useTabTree";
import { useTabActions } from "./features/tabs/hooks/useTabActions";
import { useFolderActions } from "./features/tabs/hooks/useFolderActions";

function App() {
	const { tree, loading } = useTabTree();
	const { focusTab, deleteTab, createTab } = useTabActions();
	const { createFolder, deleteFolder } = useFolderActions();

	if (loading) {
		return <div>Loading tabs...</div>;
	}

	return (
		<TabTreeView
			tree={tree}
			onSelectTab={focusTab}
			onDeleteTab={deleteTab}
			onDeleteFolder={deleteFolder}
			onCreateTab={createTab}
			onCreateFolder={createFolder}
		/>
	);
}

export default App;
