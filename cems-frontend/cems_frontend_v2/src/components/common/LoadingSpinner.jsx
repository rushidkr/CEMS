export default function LoadingSpinner({ className = '', text = 'Loading...' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
      {text && <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{text}</p>}
    </div>
  );
}

