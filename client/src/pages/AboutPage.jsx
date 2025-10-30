// client/src/pages/AboutPage.jsx

import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div>
      <h1>Про застосунок</h1>
      <p>Це демонстраційний проєкт "Каталог курсів", створений для вивчення React.</p>
      <p>Ми використовуємо React Router для навігації, завантажуємо дані з API та реалізували фільтрацію на клієнті.</p>
      <Link to="/">Перейти до каталогу</Link>
    </div>
  );
}