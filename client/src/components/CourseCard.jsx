

import { Link } from "react-router-dom"; 
import { highlight } from "../utils/highlight.jsx";

export default function CourseCard({
  id,
  title,
  category,
  price,
  popularity,
  tags = [],
  query = "",
  
}) {
  return (
    <article className="card" aria-label={`Курс ${title}`}>
      <header className="card__header">
       
         <h3
          className="card__title"
          dangerouslySetInnerHTML={{ __html: highlight(title, query) }}
        />
        <span className="card__badge" aria-label="Категорія">
          {category}
        </span>
      </header>
      <div className="card__body">
     
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
      
        <Link
          to={`/course/${id}`}
          className="button" 
          aria-label={`Детальніше про ${title}`}
        >
          Детальніше
        </Link>
      </div>
    </article>
  );
}