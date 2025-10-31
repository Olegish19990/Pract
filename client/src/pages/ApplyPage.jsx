import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  courseId: "",
  note: "",
};

export default function ApplyPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [globalMessage, setGlobalMessage] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch(`${API_BASE}/api/courses`);
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (e) {
        console.error(e);
        setGlobalMessage("Помилка: не вдалося завантажити список курсів.");
        setStatus("error");
      }
    }
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName || form.fullName.trim().length < 2) {
      newErrors.fullName = "ПІБ є обов'язковим (мін. 2 символи)";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      newErrors.email = "Введіть коректний email";
    }
    if (!form.courseId) {
      newErrors.courseId = "Необхідно обрати курс";
    }
    if (form.note && form.note.length > 1000) {
      newErrors.note = "Коментар не може перевищувати 1000 символів";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalMessage("");
    setStatus("submitting");

    if (!validateForm()) {
      setStatus("error");
      setGlobalMessage("Будь ласка, виправте помилки у формі.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 400) {
        setErrors(data.errors || {});
        setGlobalMessage("Будь ласка, виправте помилки у формі.");
        setStatus("error");
      } else if (!res.ok) {
        throw new Error(data.error || "Невідома помилка сервера");
      } else {
        setStatus("success");
        setGlobalMessage(data.message || "Заявку успішно надіслано!");
        setForm(initialFormState);
        setErrors({});
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setGlobalMessage(`Помилка: ${err.message}`);
    }
  };

  const isLoading = status === "submitting";

  return (
    <div>
      <h1>Подати заявку на курс</h1>
      <p>Заповніть форму, і ми зв'яжемося з вами найближчим часом.</p>

      {globalMessage && (
        <div
          className={`alert ${status === "success" ? "alert-success" : "alert-error"}`}
          role="alert"
        >
          {globalMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="apply-form">
        
        <div className="field">
          <label htmlFor="fullName">Ваше ПІБ*</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : null}
          />
          {errors.fullName && (
            <span id="fullName-error" className="error-message">
              {errors.fullName}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : null}
          />
          {errors.email && (
            <span id="email-error" className="error-message">
              {errors.email}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="phone">Телефон (опціонально)</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="field">
          <label htmlFor="courseId">Оберіть курс*</label>
          <select
            id="courseId"
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
            disabled={isLoading || courses.length === 0}
            aria-invalid={!!errors.courseId}
            aria-describedby={errors.courseId ? "courseId-error" : null}
          >
            <option value="">-- {courses.length > 0 ? "Обрати курс" : "Завантаження..."} --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.category})
              </option>
            ))}
          </select>
          {errors.courseId && (
            <span id="courseId-error" className="error-message">
              {errors.courseId}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="note">Коментар (до 1000 символів)</label>
          <textarea
            id="note"
            name="note"
            rows="4"
            value={form.note}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.note}
            aria-describedby={errors.note ? "note-error" : null}
          />
           {errors.note && (
            <span id="note-error" className="error-message">
              {errors.note}
            </span>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? "Надсилаємо..." : "Надіслати заявку"}
          </button>
        </div>
      </form>
    </div>
  );
}