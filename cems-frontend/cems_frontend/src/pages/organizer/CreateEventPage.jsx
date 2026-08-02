import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import EventForm from '../../components/events/EventForm';
import { eventsApi } from '../../api/events';

export default function CreateEventPage() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    const { data } = await eventsApi.create(payload);
    navigate(`/organizer/events/${data.id}`);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/20 mb-2 uppercase tracking-wider">
            ✨ Event Proposal Form
          </span>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-white mb-2">
            Create Campus Event Proposal
          </h1>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Fill in the details below. Newly created events are submitted to administrators for review and venue allocation approval.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <EventForm onSubmit={handleSubmit} submitLabel="Submit Event for Admin Approval" />
        </div>
      </div>
    </Layout>
  );
}

