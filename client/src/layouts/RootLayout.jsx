
import { NavLink, Outlet } from "react-router-dom";

const getNavLinkClass = ({ isActive }) => {
  return isActive ? "nav-link active" : "nav-link";
};

export default function RootLayout() {
  return (
    <>
      <header className="header">
        <nav className="container nav-bar">
          <span className="nav-logo">CourseHub</span>
          <ul className="nav-links">
            <li>
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

      <main className="container main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} CourseHub. Усі права захищено.</p>
        </div>
      </footer>
    </>
  );
}