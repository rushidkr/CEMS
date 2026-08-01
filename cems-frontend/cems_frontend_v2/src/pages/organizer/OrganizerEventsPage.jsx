import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { eventsApi } from '../../api/events';
import { useAuth } from '../../context/AuthContext';

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi
      .getByOrganizer(user.id, { size: 50 })
      .then(({ data }) => setEvents(data.content || []))
      .finally(() => setLoading(false));
  }, [user.id]);

  const approvedCount = events.filter((e) => e.status === 'APPROVED').length;
  const pendingCount = events.filter((e) => e.status === 'PENDING').length;
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Organizer Event Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your proposed campus events and track attendee registrations.</p>
        </div>
        <Link to="/organizer/events/new">
          <Button>+ Create New Event</Button>
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-indigo-50/60 to-white border-indigo-100">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Organized</div>
          <div className="text-3xl font-extrabold font-display text-slate-900 mt-1">{events.length}</div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50/60 to-white border-emerald-100">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved Events</div>
          <div className="text-3xl font-extrabold font-display text-slate-900 mt-1">{approvedCount}</div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50/60 to-white border-amber-100">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Approvals</div>
          <div className="text-3xl font-extrabold font-display text-slate-900 mt-1">{pendingCount}</div>
        </Card>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your events..." />
      ) : events.length === 0 ? (
        <Card className="text-center py-12 max-w-md mx-auto">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="font-bold text-slate-900 text-base font-display">No Organized Events Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Create your first campus event request for admin review.</p>
          <Link to="/organizer/events/new">
            <Button>Create Event Now</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const fillRatio = Math.min(100, Math.round(((event.registeredCount || 0) / event.capacity) * 100));
            return (
              <Card key={event.id} hover className="flex items-center justify-between flex-wrap gap-4 border border-slate-200/80">
                <div className="space-y-1.5 flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {event.category || 'General'}
                    </span>
                    <Badge status={event.status} />
                  </div>
                  <Link
                    to={`/organizer/events/${event.id}`}
                    className="text-base font-bold font-display text-slate-900 hover:text-indigo-600 transition-colors block"
                  >
                    {event.title}
                  </Link>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>📅 {format(new Date(event.startTime), 'MMM d, yyyy · h:mm a')}</span>
                    <span>📍 {event.venueName || 'Venue TBD'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">
                      {event.registeredCount || 0} / {event.capacity} Registered
                    </div>
                    <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${fillRatio}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/organizer/events/${event.id}`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-xs rounded-xl transition-all border border-slate-200/80"
                  >
                    Manage Roster &rarr;
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

