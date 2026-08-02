import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import EventCard from '../../components/events/EventCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { eventsApi } from '../../api/events';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

export default function BrowseEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [keyword, setKeyword] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await eventsApi.getUpcoming({
        category: category === 'All' ? undefined : category,
        keyword: keyword || undefined,
        size: 20,
      });
      setEvents(data.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <Layout>
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-8 sm:p-10 mb-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/20 mb-3 uppercase tracking-wider">
            🎉 Campus Events Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-2">
            Discover & Join Upcoming Campus Events
          </h1>
          <p className="text-sm text-indigo-200 leading-relaxed">
            Reserve your seats, get instant QR entry passes, and participate in technical hackathons, cultural fests, workshops, and sports tournaments.
          </p>
        </div>

        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Search & Category Filter Section */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by event title, keyword, or venue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">Category:</span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === c
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching upcoming events..." />
      ) : events.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto my-8">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-900 font-display">No Events Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No upcoming events match your selected category or search keyword. Try clearing search filters.
          </p>
          <button
            onClick={() => {
              setCategory('All');
              setKeyword('');
            }}
            className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} linkPrefix="/student/events" />
          ))}
        </div>
      )}
    </Layout>
  );
}

