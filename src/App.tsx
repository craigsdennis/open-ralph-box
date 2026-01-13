import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./HomePage";
import { ProjectPage } from "./ProjectPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:name" element={<ProjectPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
