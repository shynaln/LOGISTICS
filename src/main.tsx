
import React from "react";

import ReactDOM from "react-dom/client";

import {

  BrowserRouter,

  Routes,

  Route

} from "react-router-dom";

import App from "./App";

import CustomerApp from "./customer/CustomerApp";

import "leaflet/dist/leaflet.css";

import "./index.css";

ReactDOM.createRoot(

  document.getElementById("root")!

).render(

  <React.StrictMode>

    <BrowserRouter>

      <Routes>

        {/* ADMIN */}

        <Route
          path="/*"
          element={<App />}
        />

        {/* CUSTOMER */}

        <Route
          path="/customer/*"
          element={<CustomerApp />}
        />

      </Routes>

    </BrowserRouter>

  </React.StrictMode>
);
