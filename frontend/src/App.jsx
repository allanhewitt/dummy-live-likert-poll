import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import RespondView from "./RespondView.jsx";
import DisplayView from "./DisplayView.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/respond/:questionId" element={<RespondView />} />
        <Route path="/respond" element={<RespondView />} />
        <Route path="/display/:questionId" element={<DisplayView />} />
        <Route path="/display" element={<DisplayView />} />
        <Route path="*" element={<Navigate to="/respond" replace />} />
      </Routes>
    </HashRouter>
  );
}
