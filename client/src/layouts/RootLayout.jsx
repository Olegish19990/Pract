import { NavLink, Outlet } from "react-router-dom";
import { useCart } from "../context/cart-context.jsx";

const getNavLinkClass = ({ isActive }) => {
  return isActive ? "nav-link active" : "nav-link";
};

export default function RootLayout() {
  const { totalItems } = useCart();

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
            <li>
              <NavLink to="/apply" className={getNavLinkClass}>
                Заявка
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" className={getNavLinkClass}>
                Кошик
                {totalItems > 0 && (
                  <span
                    className="cart-badge"
                    aria-label={`(${totalItems} товарів у кошику)`}
                  >
                    {totalItems}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container">
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