import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import client from '../api/client';

const statusColor = {
  Approved: '#16a34a',
  Pending: '#ca8a04',
  Rejected: '#dc2626',
  Cancelled: '#6b7280',
  Completed: '#2563eb',
  Overridden: '#7c3aed',
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    client.get('/bookings').then((res) => setBookings(res.data));
  }, []);

  const events = useMemo(
    () =>
      bookings.map((booking) => ({
        id: booking._id,
        title: `${booking.resourceId?.name || 'Resource'} - ${booking.purpose}`,
        start: `${booking.date}T${booking.startTime}:00`,
        end: `${booking.date}T${booking.endTime}:00`,
        backgroundColor: statusColor[booking.status] || '#334155',
        borderColor: statusColor[booking.status] || '#334155',
      })),
    [bookings]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-navy">Calendar</h2>
      <div className="bg-white border rounded p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          height="auto"
        />
      </div>
    </div>
  );
};

export default BookingsPage;
