// client/src/components/CourseCard.jsx

import { Link } from "react-router-dom"; // 1. Імпортуємо Link
import { highlight } from "../utils/highlight.jsx";

export default function CourseCard({
  id,
  title,
  category,
  price,
  popularity,
  tags = [],
  query = "",
  // 2. onSelect видалено з пропсів
}) {
  return (
    <article className="card" aria-label={`Курс ${title}`}>
      <header className="card__header">
        {/* ... (незмінно) ... */}
         <h3
          className="card__title"
          dangerouslySetInnerHTML={{ __html: highlight(title, query) }}
        />
        <span className="card__badge" aria-label="Категорія">
          {category}
        </span>
      </header>
      <div className="card__body">
        {/* ... (незмінно) ... */}
        <p className="card__row">
          <strong>Ціна:</strong> {price.toLocaleString("uk-UA")} ₴
        </p>
        <p className="card__row">
          <strong>Популярність:</strong> {popularity}/100
        </p>
        {tags?.length > 0 && (
          <ul className="tags" aria-label="Теги курсу">
            {tags.map((t) => (
              <li key={t} className="tag">
                #{t}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card__footer">
        {/* 3. Замінюємо <button> на <Link> */}
        <Link
          to={`/course/${id}`}
          className="button" /* Можете додати клас, щоб Link виглядав як кнопка */
          aria-label={`Детальніше про ${title}`}
        >
          Детальніше
        </Link>
      </div>
    </article>
  );
}