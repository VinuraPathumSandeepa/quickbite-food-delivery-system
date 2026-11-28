function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="loading-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <p>{text}</p>
    </div>
  );
}

export default LoadingSpinner;
