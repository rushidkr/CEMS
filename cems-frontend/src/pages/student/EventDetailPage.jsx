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
import { useAuth } from '../../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await eventsApi.getById(id);
      setEvent(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRegister = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      const { data } = await registrationsApi.register(id);
      setMessage(
        data.status === 'REGISTERED'
          ? "You're confirmed for this event!"
          : "You've been added to the waitlist."
      );
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not register for this event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await registrationsApi.cancel(id);
      setMessage('Your registration has been cancelled.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not cancel registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage('');
    try {
      await feedbackApi.submit(id, feedbackForm);
      setMessage('Thanks for your feedback!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit feedback.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner text="Loading event details..." /></Layout>;
  if (!event) return <Layout><p className="text-slate-500">Event not found.</p></Layout>;

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cover Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-8 sm:p-10 text-white shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/20 uppercase tracking-wider">
              {event.category}
            </span>
            <Badge status={event.status} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-3">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-indigo-200">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
              <span>📅</span> {format(new Date(event.startTime), 'MMM d, yyyy · h:mm a')}
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
              <span>📍</span> {event.venueName || 'Venue TBD'}
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
              <span>👤</span> Organized by {event.organizerName}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h2 className="text-lg font-bold text-slate-900 font-display mb-3">About Event</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            </Card>

            {message && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-semibold flex items-center gap-2">
                <span>💡</span> {message}
              </div>
            )}

            {user?.role === 'STUDENT' && event.status === 'APPROVED' && (
              <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
                <h3 className="font-bold text-slate-900 text-base font-display mb-2">Event Registration</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Seats are allocated on a first-come, first-served basis. Confirming registration will issue your entry pass code.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleRegister} loading={actionLoading}>
                    Confirm Registration
                  </Button>
                  <Button onClick={handleCancel} variant="secondary" loading={actionLoading}>
                    Cancel Registration
                  </Button>
                </div>
              </Card>
            )}

            {user?.role === 'STUDENT' && event.status === 'COMPLETED' && (
              <Card>
                <h3 className="font-bold text-slate-900 text-base font-display mb-3">Leave Feedback & Review</h3>
                <form onSubmit={handleFeedback} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFeedbackForm((f) => ({ ...f, rating: star }))}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= feedbackForm.rating ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-2">{feedbackForm.rating} / 5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review / Experience</label>
                    <textarea
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm((f) => ({ ...f, comment: e.target.value }))}
                      rows={3}
                      placeholder="Share your thoughts about this event..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <Button type="submit" loading={actionLoading}>
                    Submit Event Feedback
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Sidebar Stats Box */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-base font-bold text-slate-900 font-display mb-4">Event Summary</h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Schedule</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {format(new Date(event.startTime), 'MMM d, h:mm a')} – {format(new Date(event.endTime), 'h:mm a')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Venue</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{event.venueName || 'Venue TBD'}</div>
                  {event.venueLocation && <div className="text-[11px] text-slate-500">{event.venueLocation}</div>}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Seat Availability</div>
                  <div className="font-bold text-indigo-700 mt-0.5">
                    {seatsLeft > 0 ? `${seatsLeft} Seats Available` : 'Waitlist Mode'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Total Capacity: {event.capacity} seats
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Registration Deadline</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {format(new Date(event.registrationDeadline), 'MMM d, yyyy · h:mm a')}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

