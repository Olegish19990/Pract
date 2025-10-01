import { courses } from "../data/courses.js";

export default function Filters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories = [],
  sortBy,
  onSortByChange,
}) {
  return (
    <form
      className="filters"
      onSubmit={(e) => e.preventDefault()}
      aria-label="Фільтри каталогу"
    >
      <div className="field">
        <label htmlFor="q">Пошук</label>
        <input
          id="q"
          type="search"
          placeholder="Назва або тег..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="sort">Сортувати за</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <option value="none">Без сортування</option>
          <option value="price-asc">Ціна ↑</option>
          <option value="price-desc">Ціна ↓</option>
          <option value="pop-asc">Популярність ↑</option>
          <option value="pop-desc">Популярність ↓</option>
          <option value="title-asc">Назва A→Z</option>
          <option value="title-desc">Назва Z→A</option>
        </select>
      </div>

      {categories.length > 0 && (
        <div className="field">
          <label htmlFor="cat">Категорія</label>
          <select
            id="cat"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="all">Усі</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}
    </form>
  );
}
