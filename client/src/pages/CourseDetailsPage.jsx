// client/src/pages/CourseDetailsPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function CourseDetailsPage() {
  const { id } = useParams(); // Отримуємо { id: "..." } з URL
  
  const [details, setDetails] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    
    async function run() {
      try {
        setStatus("loading");
        setError("");
        const res = await fetch(`${API_BASE}/api/courses/${id}`, {
          signal: ac.signal,
        });
        
        // Обробка неіснуючого ID (вимога UX)
        if (res.status === 404) {
          throw new Error("404");
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        setDetails(data);
        setStatus("success");
      } catch (e) {
        if (e.name === "AbortError") return;
        
        if (e.message === "404") {
          setError(`Курс з ID "${id}" не знайдено`);
        } else {
          setError(String(e.message || e));
        }
        setStatus("error");
      }
    }
    run();
    return () => ac.abort();
  }, [id]); // Ефект залежить від id

  return (
    <div>
      <nav aria-label="breadcrumb" style={{ marginBottom: 16 }}>
        <Link to="/">&larr; Назад до каталогу</Link>
      </nav>

      {status === "loading" && (
        <div className="empty" role="status">Завантаження деталей…</div>
      )}
      
      {status === "error" && (
        <div className="empty" role="alert">
          <h2>Помилка</h2>
          <p>{error}</p>
        </div>
      )}
      
      {status === "success" && details && (
        <article>
          <h1>{details.title}</h1>
          <p><strong>Категорія:</strong> {details.category}</p>
          <p><strong>Ціна:</strong> {details.price.toLocaleString("uk-UA")} ₴</p>
          <p><strong>Популярність:</strong> {details.popularity}/100</p>
          
          {details.description && (
            <div style={{ marginTop: 16 }}>
              <h3>Опис</h3>
              <p>{details.description}</p>
            </div>
          )}
          
          {details.tags?.length > 0 && (
             <ul className="tags" aria-label="Теги курсу" style={{ marginTop: 16 }}>
               {details.tags.map((t) => (
                 <li key={t} className="tag">#{t}</li>
               ))}
             </ul>
           )}
        </article>
      )}
    </div>
  );
}