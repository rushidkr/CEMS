import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { registrationsApi } from '../../api/registrations';
import { useAuth } from '../../context/AuthContext';

export default function MyRegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationsApi
      .getForStudent(user.id, { size: 50 })
      .then(({ data }) => setRegistrations(data.content || []))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleDownloadTicket = async (regId) => {
    try {
      await registrationsApi.downloadTicketPdf(regId);
    } catch {
      alert('Could not download entry ticket.');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">My Registered Events</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your active event passes and download entry tickets.</p>
        </div>
        <Link
          to="/student/events"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          + Discover More Events
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your registrations..." />
      ) : registrations.length === 0 ? (
        <Card className="text-center py-12 max-w-md mx-auto">
          <div className="text-4xl mb-2">🎟️</div>
          <h3 className="font-bold text-slate-900 text-base font-display">No Event Registrations Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">You haven't signed up for any events yet. Explore upcoming campus events to get started.</p>
          <Link
            to="/student/events"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all"
          >
            Browse Upcoming Events
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrations.map((r) => (
            <Card key={r.id} hover className="flex items-center justify-between flex-wrap gap-4 border border-slate-200/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Pass Code: CEMS-REG-{r.id}
                  </span>
                  <Badge status={r.status} />
                </div>
                <Link
                  to={`/student/events/${r.eventId}`}
                  className="text-base font-bold font-display text-slate-900 hover:text-indigo-600 transition-colors block mt-1"
                >
                  {r.eventTitle}
                </Link>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>📅 Registered: {format(new Date(r.registeredAt), 'MMM d, yyyy · h:mm a')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {r.status === 'REGISTERED' && (
                  <button
                    onClick={() => handleDownloadTicket(r.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                  >
                    <span>🎫 Download Ticket Pass (PDF)</span>
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

