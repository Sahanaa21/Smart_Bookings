import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.employeeId, form.password);
      navigate('/');
    } catch {
      setError('Invalid Employee ID or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form className="bg-white rounded-lg shadow-sm border w-full max-w-md p-6 space-y-4" onSubmit={onSubmit}>
        <h1 className="text-2xl font-semibold text-brand-navy">Smart Resource Booking</h1>
        <p className="text-sm text-slate-600">Sign in with your Employee ID</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input className="w-full border rounded px-3 py-2" placeholder="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full bg-brand-navy text-white rounded py-2">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
