import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import "./App.css";

import { CartProvider } from "./context/cart-context.jsx";
import RootLayout from "./layouts/RootLayout.jsx";

import CatalogPage from "./pages/CatalogPage.jsx";
import CourseDetailsPage from "./pages/CourseDetailsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<CatalogPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="course/:id" element={<CourseDetailsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="apply" element={<ApplyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);