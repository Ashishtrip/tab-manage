import { useEffect } from "react";
import AppLayout from "./features/tabs/components/AppLayout";
import { useTabTree } from "./features/tabs/hooks/useTabTree";
import { useTabActions } from "./features/tabs/hooks/useTabActions";
import { useFolderActions } from "./features/tabs/hooks/useFolderActions";
import { useTreeActions } from "./features/tabs/hooks/useTreeActions";
import AuthPage from "./features/auth/components/AuthPage";
import { useAuthStore } from "./features/auth/store/useAuthStore";

function App() {
	const { isAuthenticated, isLoading, checkAuth } = useAuthStore((state: any) => ({
		isAuthenticated: state.isAuthenticated,
		isLoading: state.isLoading,
		checkAuth: state.checkAuth
	}));

	const { tree, loading: treeLoading } = useTabTree();
	const { focusTab, deleteTab, createTab } = useTabActions();
	const { createFolder, deleteFolder } = useFolderActions();
	const { moveEntry } = useTreeActions();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isLoading) {
		return <div style={{ padding: 20, color: "#a0a0a0" }}>Checking authentication...</div>;
	}

	if (!isAuthenticated) {
		return <AuthPage />;
	}

	if (treeLoading) {
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
			onMoveEntry={moveEntry}
		/>
	);
}

export default App;
