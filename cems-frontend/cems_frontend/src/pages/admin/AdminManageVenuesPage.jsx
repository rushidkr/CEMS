import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { venuesApi } from '../../api/venues';

const emptyForm = { name: '', location: '', capacity: 50, facilities: '' };

export default function AdminManageVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    venuesApi.getAllActive().then(({ data }) => setVenues(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (venue) => {
    setEditingId(venue.id);
    setForm({
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
      facilities: venue.facilities,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      if (editingId) {
        await venuesApi.update(editingId, payload);
      } else {
        await venuesApi.create(payload);
      }
      setModalOpen(false);
      load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this venue?')) return;
    await venuesApi.deactivate(id);
    load();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Campus Venues & Auditoriums</h1>
          <p className="text-xs text-slate-500 mt-1">Configure campus event halls, seating capacities, and available audio/visual facilities.</p>
        </div>
        <Button onClick={openCreate}>+ Add New Venue</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading campus venue registry..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {venues.map((v) => (
            <Card key={v.id} hover className="border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-lg font-display">{v.name}</h3>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    Cap. {v.capacity}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-3">
                  <span>📍</span> {v.location}
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-700 block mb-1">Equipment & Facilities:</span>
                  {v.facilities || 'General Seating & Stage'}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <Button onClick={() => openEdit(v)} variant="secondary" className="!py-1.5 !px-3.5 text-xs flex-1">
                  ✏️ Edit Venue
                </Button>
                <Button onClick={() => handleDeactivate(v.id)} variant="danger" className="!py-1.5 !px-3.5 text-xs">
                  Deactivate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Venue Details' : 'Add New Campus Venue'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Venue Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Main Science Auditorium"
              className="w-full rounded-xl border border-slate-200/90 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Campus Location *</label>
            <input
              required
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Block C, Floor 2"
              className="w-full rounded-xl border border-slate-200/90 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Max Seating Capacity *</label>
            <input
              type="number"
              min={1}
              required
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              className="w-full rounded-xl border border-slate-200/90 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Facilities / AV Hardware</label>
            <input
              value={form.facilities}
              onChange={(e) => setForm((f) => ({ ...f, facilities: e.target.value }))}
              placeholder="4K Projector, AC, Dolby Sound, Wi-Fi"
              className="w-full rounded-xl border border-slate-200/90 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" loading={actionLoading} className="w-full py-3 text-sm">
            {editingId ? 'Save Venue Changes' : 'Create Campus Venue'}
          </Button>
        </form>
      </Modal>
    </Layout>
  );
}

