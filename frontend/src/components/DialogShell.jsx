import { useEffect, useRef } from "react";

function DialogShell({ titleId, onClose, children, className = "confirm-modal-overlay" }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector("button:not([disabled]), [href], input, select, textarea")?.focus();
    return () => previousFocus?.focus?.();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
    if (event.key !== "Tab") return;
    const focusable = [...dialogRef.current.querySelectorAll("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <div ref={dialogRef} className={className} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={handleKeyDown} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}

export default DialogShell;
