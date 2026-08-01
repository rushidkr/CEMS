import { useEffect, useState } from 'react';
import Button from '../common/Button';
import { venuesApi } from '../../api/venues';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

const toLocalInputValue = (iso) => (iso ? iso.slice(0, 16) : '');

export default function EventForm({ initialValues, onSubmit, submitLabel = 'Create Event' }) {
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    category: initialValues?.category || CATEGORIES[0],
    startTime: toLocalInputValue(initialValues?.startTime),
    endTime: toLocalInputValue(initialValues?.endTime),
    registrationDeadline: toLocalInputValue(initialValues?.registrationDeadline),
    venueId: initialValues?.venueId || '',
    capacity: initialValues?.capacity || 50,
    bannerImageUrl: initialValues?.bannerImageUrl || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    venuesApi.getAllActive().then(({ data }) => setVenues(data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        venueId: Number(form.venueId),
        capacity: Number(form.capacity),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl p-4 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Event Title *
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="e.g. Annual Code-a-Thon 2026"
          className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Event Description *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
          placeholder="Describe the agenda, highlights, eligible departments, and guidelines..."
          className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Venue Selection *
          </label>
          <select
            name="venueId"
            value={form.venueId}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>
              Select a campus venue
            </option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} (Max Cap. {v.capacity})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            End Date & Time *
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Registration Deadline *
          </label>
          <input
            type="datetime-local"
            name="registrationDeadline"
            value={form.registrationDeadline}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Max Student Capacity *
          </label>
          <input
            type="number"
            name="capacity"
            min={1}
            value={form.capacity}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Banner Cover Image URL (optional)
        </label>
        <input
          name="bannerImageUrl"
          value={form.bannerImageUrl}
          onChange={handleChange}
          placeholder="https://images.unsplash.com/photo-..."
          className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Button type="submit" loading={submitting} className="w-full py-3 text-base">
        {submitLabel}
      </Button>
    </form>
  );
}

