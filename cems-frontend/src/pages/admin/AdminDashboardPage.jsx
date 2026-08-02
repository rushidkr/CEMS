import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reportsApi } from '../../api/reports';
import { eventsApi } from '../../api/events';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ label, value, icon, color = 'indigo' }) => {
  const borderColors = {
    indigo: 'border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white text-indigo-700',
    emerald: 'border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white text-emerald-700',
    amber: 'border-amber-100 bg-gradient-to-br from-amber-50/50 to-white text-amber-700',
    purple: 'border-purple-100 bg-gradient-to-br from-purple-50/50 to-white text-purple-700',
  };

  return (
    <Card className={`border ${borderColors[color] || borderColors.indigo}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-3xl font-extrabold font-display text-slate-900 mt-2">{value}</div>
    </Card>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      reportsApi.getDashboardStats(),
      eventsApi.getByStatus('PENDING', { size: 10 }),
    ])
      .then(([statsRes, pendingRes]) => {
        setStats(statsRes.data);
        setPendingEvents(pendingRes.data.content || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await eventsApi.approve(id);
      loadData();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner text="Loading admin analytics..." /></Layout>;
  if (!stats) return <Layout><p className="text-slate-500">Could not load dashboard.</p></Layout>;

  const categoryData = Object.entries(stats.eventsByCategory || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Admin Operations & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time system overview, event approvals, and category statistics.</p>
        </div>
        <Link to="/admin/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-100">
          Manage All Events &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events" value={stats.totalEvents} icon="📅" color="indigo" />
        <StatCard label="Pending Approval" value={stats.pendingEvents} icon="⏳" color="amber" />
        <StatCard label="Approved Events" value={stats.approvedEvents} icon="✅" color="emerald" />
        <StatCard label="Completed Events" value={stats.completedEvents} icon="🏁" color="purple" />
        <StatCard label="Active Students" value={stats.totalStudents} icon="🎓" color="indigo" />
        <StatCard label="Organizers" value={stats.totalOrganizers} icon="🎯" color="purple" />
        <StatCard label="Registrations" value={stats.totalRegistrations} icon="🎟️" color="emerald" />
        <StatCard label="Cancelled" value={stats.cancelledEvents} icon="🛑" color="amber" />
      </div>

      {pendingEvents.length > 0 && (
        <Card className="mb-8 border-amber-200/90 bg-gradient-to-br from-amber-50/60 to-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
              <span>⏳</span> Pending Event Approvals ({pendingEvents.length})
            </h2>
            <Link to="/admin/events" className="text-xs font-bold text-amber-800 hover:underline">
              Review All &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {pendingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex-wrap gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm">{event.title}</div>
                  <div className="text-xs text-slate-500">
                    Organizer: <span className="font-semibold text-slate-700">{event.organizerName}</span> · Category: {event.category} · Capacity: {event.capacity}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={event.status} />
                  <Button
                    onClick={() => handleApprove(event.id)}
                    loading={actionLoading}
                    className="!py-1.5 !px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                  >
                    ✓ Approve Event
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-slate-900 font-display text-base mb-4">Events Distribution by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center">No category data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Student Satisfaction Rating</span>
          <div className="text-6xl font-black text-slate-900 font-display my-4 tracking-tight">
            {stats.averageFeedbackRating?.toFixed(1) ?? 'N/A'} <span className="text-2xl text-slate-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs">
            Calculated across verified post-event student ratings and feedback submissions.
          </p>
        </Card>
      </div>
    </Layout>
  );
}


