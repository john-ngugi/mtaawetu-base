// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./Home";
import MapPage from "../src/Pages/MapPage";
import Authentication from "../src/Pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
}

export default App;
