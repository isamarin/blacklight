import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import XCloudPage from "./pages/xcloud";
import SettingsPage from "./pages/settings/index";

import DefaultLayout from "@/layouts/default";

function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route element={<IndexPage />} path="/" />
        <Route element={<XCloudPage />} path="/xcloud" />
        <Route element={<SettingsPage />} path="/settings" />
        <Route element={<XCloudPage />} path="/stream/:serverid" />
      </Route>
    </Routes>
  );
}

export default App;
