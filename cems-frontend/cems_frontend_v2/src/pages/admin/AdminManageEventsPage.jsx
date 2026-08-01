import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { eventsApi } from '../../api/events';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

export default function AdminManageEventsPage() {
  const [status, setStatus] = useState('ALL');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    eventsApi
      .getByStatus(status, { size: 50 })
      .then(({ data }) => setEvents(data.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await eventsApi.approve(id);
      load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await eventsApi.reject(rejectTarget, rejectReason);
      setRejectTarget(null);
      setRejectReason('');
      load();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Manage Campus Events</h1>
          <p className="text-xs text-slate-500 mt-1">Review event proposals, issue approvals, or record rejection details.</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              status === s
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/90'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Filtering campus events..." />
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-xs text-slate-500">No events found matching status filter "{status}".</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} hover className="flex items-center justify-between flex-wrap gap-4 border border-slate-200/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {event.category || 'General'}
                  </span>
                  <Badge status={event.status} />
                </div>
                <Link
                  to={`/organizer/events/${event.id}`}
                  className="font-bold text-slate-900 text-base font-display hover:text-indigo-600 transition-colors block"
                >
                  {event.title}
                </Link>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>👤 Organized by: <strong className="text-slate-700">{event.organizerName}</strong></span>
                  <span>📅 Date: {format(new Date(event.startTime), 'MMM d, yyyy · h:mm a')}</span>
                  <span>📍 Venue: {event.venueName || 'Venue TBD'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {event.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => handleApprove(event.id)}
                      loading={actionLoading}
                      className="!py-1.5 !px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      onClick={() => setRejectTarget(event.id)}
                      variant="danger"
                      className="!py-1.5 !px-3.5 text-xs"
                    >
                      ✕ Reject
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Event Proposal">
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason for Rejection *
            </label>
            <textarea
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State the reason for rejecting this event proposal (e.g., venue conflict, policy violation)..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <Button type="submit" variant="danger" loading={actionLoading} className="w-full py-3 text-sm">
            Confirm Rejection & Send Feedback
          </Button>
        </form>
      </Modal>
    </Layout>
  );
}

