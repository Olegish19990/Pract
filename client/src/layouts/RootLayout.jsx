import { NavLink, Outlet } from "react-router-dom";
import { useCart } from "../context/cart-context.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const getNavLinkClass = ({ isActive }) => {
  return isActive ? "nav-link active" : "nav-link";
};

export default function RootLayout() {
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();

  return (
    <>
      <header className="header">
        <nav className="container nav-bar">
          <NavLink to="/" className="nav-logo">
            CourseHub
          </NavLink>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={getNavLinkClass} end>
                Каталог
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
                  <span className="cart-badge">{totalItems}</span>
                )}
              </NavLink>
            </li>
            {isAdmin && (
              <li>
                <NavLink to="/admin" className={getNavLinkClass}>
                  Адмінка
                </NavLink>
              </li>
            )}
          </ul>

          <div className="user-section">
            {user ? (
              <>
                <NavLink to="/me" className="nav-link">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      className="header-avatar"
                    />
                  ) : null}
                  {user.name}
                </NavLink>
                <button onClick={logout} className="button-secondary">
                  Вийти
                </button>
              </>
            ) : (
              <NavLink to="/login" className="button">
                Увійти
              </NavLink>
            )}
          </div>
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