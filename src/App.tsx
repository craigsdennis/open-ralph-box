import { useState } from "react";
import { useAgent } from "agents/react";
import type { Hub, HubState } from "../worker/agents/hub";
import "./App.css";

function App() {
  const [recentProjects, setRecentProjects] = useState([]);
  const agent = useAgent<Hub, HubState>({
    agent: "hub",
    onStateUpdate(state) {
      setRecentProjects(state.recentProjects);
    } 
  })
  return <>
  There are {recentProjects.length} projects
  </>;
}

export default App;
