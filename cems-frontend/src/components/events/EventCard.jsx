import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';

const categoryGradients = {
  Technical: 'from-indigo-600 to-blue-600',
  Cultural: 'from-purple-600 to-pink-600',
  Sports: 'from-emerald-600 to-teal-600',
  Workshop: 'from-amber-500 to-orange-600',
  Seminar: 'from-sky-600 to-cyan-600',
  Other: 'from-slate-700 to-slate-900',
};

export default function EventCard({ event, linkPrefix = '/student/events' }) {
  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fillPercentage = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const gradient = categoryGradients[event.category] || categoryGradients.Other;

  return (
    <Card hover className="flex flex-col h-full overflow-hidden !p-0 border border-slate-200/80">
      {/* Event Header Banner */}
      <div className={`h-24 bg-gradient-to-r ${gradient} p-4 relative flex flex-col justify-between text-white`}>
        <div className="flex items-center justify-between z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30">
            {event.category || 'General'}
          </span>
          <Badge status={event.status} />
        </div>
        <div className="text-xs font-semibold text-white/90 z-10 flex items-center gap-1">
          <span>📍</span> {event.venueName || 'Venue TBD'}
        </div>
        {/* Subtle background circle patterns */}
        <div className="absolute -right-4 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Event Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg leading-snug font-display group-hover:text-indigo-600 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span>📅</span> {format(new Date(event.startTime), 'MMM d, yyyy · h:mm a')}
            </span>
          </div>

          {/* Capacity Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Seats Capacity</span>
              <span className={seatsLeft > 0 ? 'text-indigo-600 font-bold' : 'text-amber-600 font-bold'}>
                {seatsLeft > 0 ? `${seatsLeft} left` : 'Waitlist Only'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  fillPercentage >= 90 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <Link
          to={`${linkPrefix}/${event.id}`}
          className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-xs text-center border border-slate-200/80 hover:border-indigo-200 transition-all flex items-center justify-center gap-1 group"
        >
          <span>View Event Details</span>
          <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>
    </Card>
  );
}

