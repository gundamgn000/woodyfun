export function HeartOutline({ className = "w-8 h-8" }) {
  return (
    <svg
      className={`transition-all duration-200 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ff4f8b"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-6.5-4.5-9-8.4C1 9.5 2 5.5 5.5 4 8.2 2.9 10.8 4.3 12 6c1.2-1.7 3.8-3.1 6.5-2 3.5 1.5 4.5 5.5 2.5 8.6C18.5 16.5 12 21 12 21z" />
    </svg>
  );
}

export function HeartFilled({ className = "w-8 h-8" }) {
  return (
    <svg
      className={`transition-all duration-200 ${className}`}
      viewBox="0 0 24 24"
      fill="#ff4f8b"
      stroke="none"
    >
      <path d="M12 21s-6.5-4.5-9-8.4C1 9.5 2 5.5 5.5 4 8.2 2.9 10.8 4.3 12 6c1.2-1.7 3.8-3.1 6.5-2 3.5 1.5 4.5 5.5 2.5 8.6C18.5 16.5 12 21 12 21z" />
    </svg>
  );
}
