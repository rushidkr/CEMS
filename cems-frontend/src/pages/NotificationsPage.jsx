import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { notificationsApi } from '../api/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationsApi
      .getMine({ size: 50 })
      .then(({ data }) => setNotifications(data.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    load();
  };

  const handleMarkRead = async (id) => {
    await notificationsApi.markAsRead(id);
    load();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">System Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">Updates on event approvals, seat confirmations, and reminders.</p>
        </div>
        <Button onClick={handleMarkAllRead} variant="secondary" className="!py-2 text-xs">
          ✓ Mark All as Read
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-2">🔔</div>
          <h3 className="font-bold text-slate-900 text-base font-display">No Notifications</h3>
          <p className="text-xs text-slate-500 mt-1">You're all caught up! New notifications will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              hover
              className={`flex items-start justify-between gap-4 border transition-all ${
                !n.isRead
                  ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-white shadow-xs'
                  : 'border-slate-200/80 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${!n.isRead ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  🔔
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm font-display">{n.title}</h4>
                    {!n.isRead && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="text-[11px] text-slate-400 font-medium pt-1">
                    {format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-2xs hover:bg-indigo-50 transition-all"
                >
                  ✓ Mark Read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

