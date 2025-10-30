import { Link } from "react-router-dom";
import { useCart } from "../context/cart-context.jsx";

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart();

  if (totalItems === 0) {
    return (
      <div className="empty" style={{ textAlign: "center", padding: "40px 0" }}>
        <h2>Ваш кошик порожній</h2>
        <p>Схоже, ви ще нічого не додали.</p>
        <Link to="/" className="button">
          &larr; Повернутися до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Ваш кошик</h1>

      <table className="cart-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Ціна</th>
            <th>Кількість</th>
            <th>Сума</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.price.toLocaleString("uk-UA")} ₴</td>
              <td>
                <div className="quantity-control">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Зменшити кількість ${item.title}`}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label={`Збільшити кількість ${item.title}`}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>{(item.price * item.quantity).toLocaleString("uk-UA")} ₴</td>
              <td>
                <button
                  onClick={() => removeItem(item.id)}
                  className="button-danger"
                  aria-label={`Видалити ${item.title} з кошика`}
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <h2>Разом: {totalPrice.toLocaleString("uk-UA")} ₴</h2>
        <div className="cart-summary-actions">
          <button
            onClick={clearCart}
            className="button-secondary"
            aria-label="Очистити весь кошик"
          >
            Очистити кошик
          </button>
          <button
            onClick={() => alert("Функція оформлення замовлення в розробці!")}
            className="button"
          >
            Оформити замовлення
          </button>
        </div>
      </div>
    </div>
  );
}