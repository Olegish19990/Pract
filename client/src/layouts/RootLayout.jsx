
import { NavLink, Outlet } from "react-router-dom";

// Функція для визначення активного класу NavLink
const getNavLinkClass = ({ isActive }) => {
  return isActive ? "nav-link active" : "nav-link";
};

export default function RootLayout() {
  return (
    <>
      {/* Хедер з навігацією */}
      <header className="header">
        <nav className="container nav-bar">
          <span className="nav-logo">CourseHub</span>
          <ul className="nav-links">
            <li>
              {/* 'end' потрібен, щоб / не був активним на /about */}
              <NavLink to="/" className={getNavLinkClass} end>
                Каталог
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={getNavLinkClass}>
                Про нас
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      {/* Основний контент (сюди рендеряться сторінки) */}
      <main className="container">
        <Outlet />
      </main>

      {/* Футер */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} CourseHub. Усі права захищено.</p>
        </div>
      </footer>
    </>
  );
}