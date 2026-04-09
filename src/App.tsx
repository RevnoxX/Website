/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import AirQuality from "./pages/AirQuality";
import ClimateWater from "./pages/ClimateWater";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="air-quality" element={<AirQuality />} />
          <Route path="climate-water" element={<ClimateWater />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

