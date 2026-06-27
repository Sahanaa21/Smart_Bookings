import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/resources', label: 'Resources' },
  { to: '/availability', label: 'Availability' },
  { to: '/timeline', label: 'Timeline' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="w-64 bg-brand-navy text-white min-h-screen p-4">
          <h1 className="font-semibold text-lg">Smart Resource Booking</h1>
          <p className="text-xs text-gray-200 mt-1">Institutional Admin Portal</p>
          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded px-3 py-2 ${location.pathname === item.to ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Logged in as</p>
              <p className="font-semibold">{user?.name} ({user?.role})</p>
            </div>
            <button onClick={logout} className="rounded bg-brand-navy text-white px-4 py-2">Logout</button>
          </header>
          <main className="p-6"><Outlet /></main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
