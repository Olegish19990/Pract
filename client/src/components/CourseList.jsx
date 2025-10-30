// client/src/components/CourseList.jsx

import CourseCard from "./CourseCard.jsx";

// 1. onSelect видалено з пропсів
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
          {/* 2. onSelect видалено з CourseCard */}
          <CourseCard {...c} query={query} />
        </div>
      ))}
    </div>
  );
}