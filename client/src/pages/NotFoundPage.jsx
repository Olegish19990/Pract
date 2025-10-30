
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <h1>404</h1>
      <p>На жаль, сторінку, яку ви шукаєте, не знайдено.</p>
      <Link to="/">Повернутися на головну</Link>
    </div>
  );
}