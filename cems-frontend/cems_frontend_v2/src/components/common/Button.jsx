const variants = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]',
  secondary:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-[0.98]',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-slate-100/80 text-slate-700 active:scale-[0.98]',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

