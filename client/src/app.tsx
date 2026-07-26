import AppLayout from "./features/tabs/components/AppLayout";
import { useTabTree } from "./features/tabs/hooks/useTabTree";
import { useTabActions } from "./features/tabs/hooks/useTabActions";
import { useFolderActions } from "./features/tabs/hooks/useFolderActions";

function App() {
	const { tree, loading } = useTabTree();
	const { focusTab, deleteTab, createTab } = useTabActions();
	const { createFolder, deleteFolder } = useFolderActions();

	if (loading) {
		return <div style={{ padding: 20, color: "#a0a0a0" }}>Loading tabs...</div>;
	}

	return (
		<AppLayout
			tree={tree}
			onSelectTab={focusTab}
			onDeleteTab={deleteTab}
			onDeleteFolder={deleteFolder}
			onCreateTab={(_, url) => createTab(url)}
			onCreateFolder={(context, name) => createFolder(context, name)}
		/>
	);
}

export default App;
