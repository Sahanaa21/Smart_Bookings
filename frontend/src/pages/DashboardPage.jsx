import { useEffect, useState } from 'react';
import client from '../api/client';

const cards = [
  { key: 'totalResources', label: 'Total Resources' },
  { key: 'activeBookings', label: 'Active Bookings' },
  { key: 'pendingRequests', label: 'Pending Requests' },
  { key: 'overrides', label: 'Override Statistics' },
  { key: 'noShows', label: 'No-show Statistics' },
];

const DashboardPage = () => {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    client.get('/analytics/summary').then((res) => setSummary(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-navy">Dashboard</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.key} className="bg-white border rounded p-4">
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="text-2xl font-semibold">{summary[card.key] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
