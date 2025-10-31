import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import "./App.css";

import { CartProvider } from "./context/cart-context.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import RootLayout from "./layouts/RootLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import CatalogPage from "./pages/CatalogPage.jsx";
import CourseDetailsPage from "./pages/CourseDetailsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<CatalogPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="course/:id" element={<CourseDetailsPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="apply" element={<ApplyPage />} />

              <Route path="login" element={<LoginPage />} />

              <Route
                path="me"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);