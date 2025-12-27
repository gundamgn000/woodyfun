export default function AdminCard({ children, className = "" }) {
  return (
    <div
      className={
        "bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 px-8 py-10 " +
        className
      }
    >
      {children}
    </div>
  );
}
