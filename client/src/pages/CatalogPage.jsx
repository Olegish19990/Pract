
import { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters.jsx";
import CourseList from "../components/CourseList.jsx";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function CatalogPage() {
 
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("none");

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");


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
    <>
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
        <CourseList items={visible} query={query} />
      )}
      
    </>
  );
}