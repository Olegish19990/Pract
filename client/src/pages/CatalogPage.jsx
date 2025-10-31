import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const CARD_HEIGHT = 300;

export default function CatalogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    async function run() {
      try {
        setStatus("loading");
        setError("");

        const params = new URLSearchParams({
          query,
          page,
          limit,
          sort: sortBy,
          order,
        });

        if (category !== "all") params.append("category", category);

        const res = await fetch(`${API_BASE}/api/courses?${params.toString()}`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setStatus("success");
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(String(e.message || e));
        setStatus("error");
      }
    }
    run();
    return () => ac.abort();
  }, [query, category, sortBy, order, page, limit]);

  const handleSortChange = (newSortBy) => {
    if (newSortBy.includes("-")) {
      const [sort, newOrder] = newSortBy.split("-");
      setSortBy(sort);
      setOrder(newOrder);
    } else {
      setSortBy(newSortBy);
      setOrder("asc");
    }
    setPage(1);
  };

  const handleQueryChange = (newQuery) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const Row = ({ index, style }) => {
    const course = items[index];
    return (
      <div style={{ ...style, padding: "10px" }}>
        <CourseCard {...course} query={query} />
      </div>
    );
  };

  const listHeight = Math.ceil(items.length / 3) * (CARD_HEIGHT + 20);

  return (
    <>
      <h1>Каталог курсів</h1>
      <p>Знайдено: {total} курсів</p>

      <Filters
        query={query}
        onQueryChange={handleQueryChange}
        category={category}
        onCategoryChange={setCategory}
        sortBy={`${sortBy}-${order}`}
        onSortByChange={handleSortChange}
      />

      {status === "loading" && (
        <div className="empty" role="status">
          Завантаження…
        </div>
      )}
      {status === "error" && (
        <div className="empty" role="alert">
          Сталася помилка: {error}
        </div>
      )}
      {status === "success" && (
  <>
    {items.length === 0 ? (
      <div className="empty">Курсів не знайдено</div>
    ) : (
   
      <div className="course__list">
        {items.map((course) => (
          <div key={course.id} className="list__item">
            <CourseCard {...course} query={query} />
          </div>
        ))}
      </div>
    )}

    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  </>
)}
    </>
  );
}