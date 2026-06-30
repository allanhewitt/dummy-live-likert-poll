import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RespondView from "./RespondView.jsx";
import DisplayView from "./DisplayView.jsx";
import ControlView from "./ControlView.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/respond" element={<RespondView />} />
        <Route path="/display" element={<DisplayView />} />
        <Route path="/control" element={<ControlView />} />
        <Route path="*" element={<Navigate to="/respond" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
