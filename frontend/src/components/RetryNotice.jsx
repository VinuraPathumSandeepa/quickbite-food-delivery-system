function RetryNotice({ message, onRetry }) {
  if (!message) return null;
  return <div className="error-box retry-notice" role="alert"><span>{message}</span><button type="button" className="outline-btn" onClick={onRetry}>Try again</button></div>;
}

export default RetryNotice;
