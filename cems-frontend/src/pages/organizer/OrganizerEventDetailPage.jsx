import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { eventsApi } from '../../api/events';
import { registrationsApi } from '../../api/registrations';
import { feedbackApi } from '../../api/feedback';

export default function OrganizerEventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const [eventRes, regRes] = await Promise.all([
      eventsApi.getById(id),
      registrationsApi.getForEvent(id),
    ]);
    setEvent(eventRes.data);
    setRegistrations(regRes.data);
    if (eventRes.data.status === 'COMPLETED') {
      feedbackApi.getAverageRating(id).then(({ data }) => setAvgRating(data));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCheckIn = async (studentId) => {
    setActionLoading(true);
    try {
      await registrationsApi.checkIn(id, studentId);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!window.confirm('Cancel this event? Registered students will be notified.')) return;
    setActionLoading(true);
    try {
      await eventsApi.cancel(id);
      load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setActionLoading(true);
    try {
      await eventsApi.downloadAttendeesPdf(id);
    } catch {
      setMessage('Could not download attendee roster PDF.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner text="Loading event & attendee roster..." /></Layout>;
  if (!event) return <Layout><p className="text-slate-500">Event not found.</p></Layout>;

  const checkedInCount = registrations.filter((r) => r.checkedInAt).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Event Card */}
        <Card className="border border-slate-200/80">
          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {event.category || 'General'}
              </span>
              <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">{event.title}</h1>
            </div>
            <Badge status={event.status} />
          </div>

          <p className="text-sm text-slate-600 mb-4">{event.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Date & Time</div>
              <div className="font-semibold text-slate-800 mt-0.5">
                {format(new Date(event.startTime), 'MMM d, yyyy · h:mm a')}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Registered Capacity</div>
              <div className="font-bold text-indigo-700 mt-0.5">
                {event.registeredCount} / {event.capacity} Students ({checkedInCount} Checked In)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Average Feedback</div>
              <div className="font-bold text-amber-600 mt-0.5">
                {avgRating !== null ? `⭐ ${avgRating.toFixed(1)} / 5.0 Rating` : 'Pending Event Completion'}
              </div>
            </div>
          </div>

          {event.status === 'REJECTED' && event.rejectionReason && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-4">
              ❌ Admin Rejection Reason: {event.rejectionReason}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
              💡 {message}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            <Button onClick={handleExportPdf} variant="secondary" loading={actionLoading}>
              📄 Export Attendee Roster (PDF)
            </Button>

            {['PENDING', 'APPROVED'].includes(event.status) && (
              <Button onClick={handleCancelEvent} variant="danger" loading={actionLoading}>
                Cancel Event
              </Button>
            )}
          </div>
        </Card>

        {/* Registered Students Roster */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-display text-slate-900">
              Registered Student Roster ({registrations.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Checked-In Ratio: {registrations.length > 0 ? Math.round((checkedInCount / registrations.length) * 100) : 0}%
            </span>
          </div>

          {registrations.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-xs text-slate-500">No students have registered for this event yet.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {registrations.map((r) => (
                <Card key={r.id} className="flex items-center justify-between py-3.5 px-5 border border-slate-200/80">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 text-sm">{r.studentName}</div>
                    <div className="text-xs text-slate-500">
                      Registered {format(new Date(r.registeredAt), 'MMM d, h:mm a')}
                      {r.checkedInAt && (
                        <span className="ml-2 text-emerald-600 font-semibold">
                          ✓ Checked in at {format(new Date(r.checkedInAt), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge status={r.status} />
                    {r.status === 'REGISTERED' && !r.checkedInAt && (
                      <Button
                        onClick={() => handleCheckIn(r.studentId)}
                        loading={actionLoading}
                        className="!py-1.5 !px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        ✓ Mark Checked-In
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

