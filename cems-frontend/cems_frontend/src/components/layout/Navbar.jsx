import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api/notifications';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    notificationsApi
      .getUnreadCount()
      .then(({ data }) => setUnreadCount(data))
      .catch(() => {});
  }, [user]);

  const roleColors = {
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200/80',
    ORGANIZER: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    STUDENT: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold font-display shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <span className="text-xl font-bold font-display text-slate-900 tracking-tight">CEMS</span>
            <span className="text-[10px] block font-semibold text-indigo-600 uppercase tracking-wider -mt-1">Events Portal</span>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/notifications"
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-[9px] font-bold text-white items-center justify-center">
                    {unreadCount}
                  </span>
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-800 leading-tight">{user.fullName}</div>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-0.5 ${roleColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-xs font-semibold flex items-center gap-1"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

