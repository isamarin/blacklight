import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import XCloudPage from "./pages/xcloud";
import SettingsPage from "./pages/settings";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<XCloudPage />} path="/xcloud" />
      <Route element={<SettingsPage />} path="/settings" />
    </Routes>
  );
}

export default App;
