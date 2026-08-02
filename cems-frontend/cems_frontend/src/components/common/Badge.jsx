const statusStyles = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80 dot-amber',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dot-emerald',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80 dot-rose',
  ONGOING: 'bg-sky-50 text-sky-700 border-sky-200/80 dot-sky',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200/80 dot-slate',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/80 dot-rose',
  REGISTERED: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dot-indigo',
  WAITLISTED: 'bg-amber-50 text-amber-700 border-amber-200/80 dot-amber',
  ATTENDED: 'bg-teal-50 text-teal-700 border-teal-200/80 dot-teal',
};

const dotColors = {
  PENDING: 'bg-amber-500',
  APPROVED: 'bg-emerald-500',
  REJECTED: 'bg-rose-500',
  ONGOING: 'bg-sky-500 animate-pulse',
  COMPLETED: 'bg-slate-400',
  CANCELLED: 'bg-rose-500',
  REGISTERED: 'bg-indigo-500',
  WAITLISTED: 'bg-amber-500',
  ATTENDED: 'bg-teal-500',
};

export default function Badge({ status }) {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dotColor = dotColors[status] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}

