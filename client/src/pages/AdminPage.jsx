import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const initialFormState = {
  title: "",
  category: "web",
  price: 10000,
  popularity: 50,
  tags: "",
  description: "",
};

export default function AdminPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setStatus("loading");
      const res = await fetch(`${API_BASE}/api/courses?limit=1000`);
      const data = await res.json();
      setCourses(data.items || []);
      setStatus("success");
    } catch (e) {
      setError("Failed to fetch courses");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `${API_BASE}/api/courses/${editingId}`
      : `${API_BASE}/api/courses`;

    const method = editingId ? "PATCH" : "POST";

    const payload = {
      ...form,
      price: Number(form.price),
      popularity: Number(form.popularity),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server error");
      }

      setForm(initialFormState);
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setForm({
      ...course,
      tags: course.tags?.join(", ") || "",
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей курс?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialFormState);
  };

  return (
    <div>
      <h1>Адмін-панель: Керування курсами</h1>

      <form onSubmit={handleSubmit} className="apply-form">
        <h2>{editingId ? "Редагувати курс" : "Створити новий курс"}</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label>Назва*</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label>Категорія*</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label>Ціна*</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label>Популярність (0-100)</label>
          <input
            name="popularity"
            type="number"
            value={form.popularity}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label>Теги (через кому)</label>
          <input name="tags" value={form.tags} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Опис</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="button">
            {editingId ? "Оновити" : "Створити"}
          </button>
          {editingId && (
            <button
              type="button"
              className="button-secondary"
              onClick={cancelEdit}
            >
              Скасувати
            </button>
          )}
        </div>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Існуючі курси</h2>
      {status === "loading" && <p>Завантаження списку...</p>}
      <div className="admin-course-list">
        {courses.map((course) => (
          <div key={course.id} className="admin-course-item">
            <span>
              {course.title} ({course.category})
            </span>
            <div>
              <button
                className="button-secondary"
                onClick={() => handleEdit(course)}
              >
                Редагувати
              </button>
              <button
                className="button-danger"
                onClick={() => handleDelete(course.id)}
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}