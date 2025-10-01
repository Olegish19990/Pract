import { useEffect, useMemo, useState } from "react";
import Filters from "./components/Filters.jsx";
import CourseList from "./components/CourseList.jsx";
import Modal from "./components/Modal.jsx"; 
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function App() {

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("none");


  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); 
  const [error, setError] = useState("");


  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState("idle");
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    async function run() {
      try {
        setStatus("loading");
        setError("");
        const res = await fetch(`${API_BASE}/api/courses`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(data);
        setStatus("success");
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(String(e.message || e));
        setStatus("error");
      }
    }
    run();
    return () => ac.abort();
  }, []);


  useEffect(() => {
    if (!selectedId) {
      setDetails(null);
      return;
    }
    const ac = new AbortController();
    async function run() {
      try {
        setDetailsStatus("loading");
        setDetailsError("");
        const res = await fetch(`${API_BASE}/api/courses/${selectedId}`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDetails(data);
        setDetailsStatus("success");
      } catch (e) {
        if (e.name === "AbortError") return;
        setDetailsError(String(e.message || e));
        setDetailsStatus("error");
      }
    }
    run();
    return () => ac.abort();
  }, [selectedId]);

  const categories = useMemo(
    () => Array.from(new Set(items.map((c) => c.category))),
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((c) => {
      const inTitle = c.title.toLowerCase().includes(q);
      const inTags = c.tags?.some((t) => t.toLowerCase().includes(q));
      const catOk = category === "all" || c.category === category;
      return catOk && (q === "" || inTitle || inTags);
    });
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "pop-asc":
        list.sort((a, b) => a.popularity - b.popularity);
        break;
      case "pop-desc":
        list.sort((a, b) => b.popularity - a.popularity);
        break;
      case "title-asc":
        list.sort((a, b) => a.title.localeCompare(b.title, "uk"));
        break;
      case "title-desc":
        list.sort((a, b) => b.title.localeCompare(a.title, "uk"));
        break;
      default:
        break;
    }
    return list;
  }, [items, query, category, sortBy]);

  return (
    <main className="container">
      <h1>Каталог курсів</h1>

      <Filters
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {status === "loading" && (
        <div className="empty" role="status">
          Завантаження…
        </div>
      )}
      {status === "error" && (
        <div className="empty" role="status">
          Сталася помилка: {error}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => window.location.reload()}>
              Спробувати знову
            </button>
          </div>
        </div>
      )}
      {status === "success" && (
        <>
          <CourseList items={visible} query={query} onSelect={setSelectedId} />

          {}
          <Modal
            open={Boolean(selectedId)}
            onClose={() => setSelectedId(null)}
            title={details?.title || "Деталі курсу"}
          >
            {detailsStatus === "loading" && (
              <p role="status">Завантаження деталей…</p>
            )}
            {detailsStatus === "error" && (
              <p role="status">Помилка: {detailsError}</p>
            )}
            {detailsStatus === "success" && details && (
              <div>
                <p>
                  <strong>Категорія:</strong> {details.category}
                </p>
                <p>
                  <strong>Ціна:</strong>{" "}
                  {details.price.toLocaleString("uk-UA")} ₴
                </p>
                <p>
                  <strong>Популярність:</strong> {details.popularity}/100
                </p>
                {details.description && (
                  <p style={{ marginTop: 8 }}>{details.description}</p>
                )}
              </div>
            )}
          </Modal>
        </>
      )}
    </main>
  );
}
