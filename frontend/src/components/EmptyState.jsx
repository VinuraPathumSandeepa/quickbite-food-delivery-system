import { Link } from "react-router-dom";

function EmptyState({ icon = "📦", title, text, linkText, linkTo, actionText, onAction }) {
  return (
    <div className="empty-state-card">
      <div className="empty-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>

      {linkText && linkTo && (
        <Link to={linkTo} className="solid-btn empty-action">
          {linkText}
        </Link>
      )}

      {actionText && onAction && (
        <button type="button" className="solid-btn empty-action" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
