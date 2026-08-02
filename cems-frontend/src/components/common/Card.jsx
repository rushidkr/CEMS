export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-200 ${
        hover ? 'glass-card-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

