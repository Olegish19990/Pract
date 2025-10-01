import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";


export default function Modal({ open, onClose, title = "Діалог", children }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return;

    lastFocused.current = document.activeElement;

    // автофокус внутрь модалки
    const timer = setTimeout(() => {
      const focusable = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable || dialogRef.current)?.focus();
    }, 0);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      } else if (e.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = "";
      lastFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Закрити діалог"
          >
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
