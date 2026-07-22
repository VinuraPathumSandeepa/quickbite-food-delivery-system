import { Link } from "react-router-dom";

function EmptyState({ icon = "📦", title, text, linkText, linkTo }) {
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
    </div>
  );
}

export default EmptyState;