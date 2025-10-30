

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import "./App.css";


import RootLayout from "./layouts/RootLayout.jsx";

import CatalogPage from "./pages/CatalogPage.jsx";
import CourseDetailsPage from "./pages/CourseDetailsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<CatalogPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="course/:id" element={<CourseDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);