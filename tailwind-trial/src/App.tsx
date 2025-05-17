// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./Home";
import MapPage from "../src/Pages/MapPage";
import Authentication from "../src/Pages/Login";
// import { Notebook } from "lucide-react";
// import Notebooks from "../src/Pages/Notebooks";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/map" element={<MapPage />} />
        {/* <Route path="/notebooks" element={<Notebooks />}></Route> */}
      </Routes>
    </Router>
  );
}

export default App;
