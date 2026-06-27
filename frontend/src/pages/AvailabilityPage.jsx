import { useState } from 'react';
import client from '../api/client';

const AvailabilityPage = () => {
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '', attendeesCount: 1 });
  const [result, setResult] = useState(null);

  const search = async (e) => {
    e.preventDefault();
    const { data } = await client.get('/bookings/availability', { params: form });
    setResult(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-navy">Train/Flight Style Availability</h2>
      <form onSubmit={search} className="bg-white border rounded p-4 grid md:grid-cols-4 gap-3">
        <input className="border rounded px-3 py-2" type="date" required onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className="border rounded px-3 py-2" type="time" required onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        <input className="border rounded px-3 py-2" type="time" required onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        <input className="border rounded px-3 py-2" type="number" min="1" value={form.attendeesCount} onChange={(e) => setForm({ ...form, attendeesCount: e.target.value })} />
        <button className="bg-brand-navy text-white rounded px-4 py-2 md:col-span-4">Search Availability</button>
      </form>

      {result && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold text-green-700">Available Resources</h3>
            <ul className="list-disc ml-5 mt-2">
              {result.availableResources.map((item) => <li key={item._id}>{item.name}</li>)}
            </ul>
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold text-red-700">Unavailable Resources</h3>
            <ul className="list-disc ml-5 mt-2">
              {result.unavailableResources.map((item) => <li key={item.resource._id}>{item.resource.name}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityPage;
