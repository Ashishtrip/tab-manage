import { useEffect, useState } from "react";
import TabTreeView, { type TabTree } from "./features/tabs/components/TabTree";

function App() {
  const [tree, setTree] = useState<TabTree>({});

  useEffect(() => {
    fetch("/api/tabs/tree")
      .then((res) => res.json())
      .then(setTree);
  }, []);

  return <TabTreeView tree={tree} />;
}
export default App;

