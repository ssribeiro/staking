import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MyContextAccount from "../context/ContextAccount";
import HomePage from "./home/home";
import "./App.scss";


function App() {
  /** Add event from account to navbar */
  const [onEvent, setOnEvent] = useState(false);


  return (
      <BrowserRouter>
        <MyContextAccount.Provider value={{ onEvent, setOnEvent }}>
          <AppContent/>
        </MyContextAccount.Provider>
      </BrowserRouter>
  );
}

function AppContent() {
  return (
      <>
        <Routes>
          <Route path="/" element={<HomePage></HomePage>} />
        </Routes>
      </>
  )
}

export default App;
