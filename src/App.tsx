import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JuzPage from "./pages/JuzPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/juz/:id" element={<JuzPage />} />
    </Routes>
  );
}
