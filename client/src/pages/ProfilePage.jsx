import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function ProfilePage() {
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatarUrl || null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setError("");

    const formData = new FormData();
    formData.append("avatar", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(Math.round(percentComplete));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setStatus("success");
        const response = JSON.parse(xhr.responseText);
        setPreview(API_BASE + response.url);
        setError("Аватар оновлено! Оновіть сторінку, щоб побачити в хедері.");
      } else {
        setStatus("error");
        try {
          const response = JSON.parse(xhr.responseText);
          setError(response.error || "Помилка завантаження");
        } catch (e) {
          setError(`Помилка: ${xhr.status} ${xhr.statusText}`);
        }
      }
    };

    xhr.onerror = () => {
      setStatus("error");
      setError("Мережева помилка або сервер недоступний.");
    };

    xhr.open("POST", `${API_BASE}/api/uploads/avatar`);
    xhr.withCredentials = true;
    xhr.send(formData);
  };

  if (!user) return null;

  return (
    <div>
      <h1>Мій кабінет</h1>
      <p>Вітаємо, {user.name}!</p>
      <p>Ваша роль: {user.role}</p>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Оновити аватар</h2>
      <div className="avatar-uploader">
        {preview && (
          <img
            src={preview.startsWith("blob:") ? preview : API_BASE + preview}
            alt="Прев'ю аватару"
            className="avatar-preview"
          />
        )}

        <div className="field">
          <label htmlFor="avatar-input">Оберіть файл (jpg/png, до 2MB)</label>
          <input
            type="file"
            id="avatar-input"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />
        </div>

        {status === "uploading" && (
          <div className="progress-bar">
            <div style={{ width: `${progress}%` }}>{progress}%</div>
          </div>
        )}

        {error && (
          <div
            className={`alert ${
              status === "success" ? "alert-success" : "alert-error"
            }`}
          >
            {error}
          </div>
        )}

        <button
          className="button"
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
        >
          {status === "uploading" ? "Завантаження..." : "Завантажити"}
        </button>
      </div>
    </div>
  );
}