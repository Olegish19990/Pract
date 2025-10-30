
import CourseCard from "./CourseCard.jsx";

export default function CourseList({ items, query }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty" role="status" aria-live="polite">
        Порожньо
      </div>
    );
  }
  return (
    <div className="course__list">
      {items.map((c) => (
        <div key={c.id} className="list__item">
          <CourseCard {...c} query={query} />
        </div>
      ))}
    </div>
  );
}