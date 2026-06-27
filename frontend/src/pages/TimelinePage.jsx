import { useEffect, useState } from 'react';
import client from '../api/client';

const TimelinePage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    client.get('/bookings').then((res) => setBookings(res.data));
  }, []);

  const grouped = bookings.reduce((acc, booking) => {
    const resourceName = booking.resourceId?.name || 'Unknown Resource';
    if (!acc[resourceName]) acc[resourceName] = [];
    acc[resourceName].push(booking);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-navy">Resource Timeline</h2>
      <div className="space-y-3">
        {Object.entries(grouped).map(([resource, items]) => (
          <div key={resource} className="bg-white border rounded p-4">
            <h3 className="font-semibold">{resource}</h3>
            <ul className="mt-2 text-sm space-y-1">
              {items.map((item) => (
                <li key={item._id}>
                  {item.startTime} - {item.endTime} : {item.purpose} ({item.status})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelinePage;
