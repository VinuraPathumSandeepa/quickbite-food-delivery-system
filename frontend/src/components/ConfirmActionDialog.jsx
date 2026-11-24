import DialogShell from "./DialogShell";

function ConfirmActionDialog({ title, description, busy, onClose, onConfirm, confirmLabel = "Delete" }) {
  return (
    <DialogShell titleId="confirm-action-title" onClose={onClose}>
      <div className="confirm-modal-card">
        <button type="button" className="confirm-modal-close" aria-label="Close confirmation" onClick={onClose} disabled={busy}>×</button>
        <div className="confirm-modal-icon" aria-hidden="true">!</div>
        <h2 id="confirm-action-title">{title}</h2>
        <p>{description}</p>
        <div className="confirm-modal-actions">
          <button type="button" className="confirm-cancel-btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="confirm-delete-btn" onClick={onConfirm} disabled={busy}>{busy ? "Deleting..." : confirmLabel}</button>
        </div>
      </div>
    </DialogShell>
  );
}

export default ConfirmActionDialog;
