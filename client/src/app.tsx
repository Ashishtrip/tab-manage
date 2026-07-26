import TabTreeView from "./features/tabs/components/TabTree";
import { useTabTree } from "./features/tabs/hooks/useTabTree";

function App() {
	const { tree, loading } = useTabTree();

	if (loading) {
		return <div>Loading tabs...</div>;
	}

	return <TabTreeView tree={tree} />;
}

export default App;
