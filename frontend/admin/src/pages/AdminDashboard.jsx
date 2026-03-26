import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, LayoutDashboard, CreditCard, PackageSearch, Users, RefreshCcw } from 'lucide-react';

const AdminDashboard = ({ logout }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ payments: 0, items: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const [payRes, itemRes] = await Promise.all([
        axios.get('http://localhost:5050/api/payments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5050/api/items', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setPayments(payRes.data.payments || []);
    //   setStats({ payments: payRes.data.total, items: itemRes.data.length });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
          <span className="font-bold text-xl tracking-tight">UniHub Panel</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<CreditCard size={20} />} label="Payments" />
          <NavItem icon={<PackageSearch size={20} />} label="Lost & Found" />
          <NavItem icon={<Users size={20} />} label="Admins" />
        </nav>

        <button 
          onClick={logout}
          className="mt-auto flex items-center gap-3 text-slate-500 hover:text-rose-600 p-3 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Welcome, Admin</h1>
            <p className="text-slate-500 mt-1">Here's what's happening at UniHub today.</p>
          </div>
          <button className="admin-btn flex items-center gap-2" onClick={fetchData}>
            <RefreshCcw size={18} />
            Refresh
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Revenue" value="$12,450" color="bg-indigo-50 text-indigo-700" />
          <StatCard title="Pending Payments" value="23" color="bg-amber-50 text-amber-700" />
          <StatCard title="Found Items" value="156" color="bg-emerald-50 text-emerald-700" />
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 bg-white">
          <h3 className="text-xl font-bold mb-6">Recent Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4 px-4">Student ID</th>
                  <th className="pb-4 px-4">Amount</th>
                  <th className="pb-4 px-4">Date</th>
                  <th className="pb-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan="4" className="py-10 text-center text-dim">Loading records...</td></tr>
                ) : payments.length === 0 ? (
                    <tr><td colSpan="4" className="py-10 text-center text-dim">No recent payments</td></tr>
                ) : (
                    payments.slice(0, 5).map((pay) => (
                        <tr key={pay._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-semibold">{pay.userId}</td>
                            <td className="py-4 px-4 font-bold text-slate-900">${pay.amount}</td>
                            <td className="py-4 px-4 text-dim text-sm">{new Date(pay.createdAt).toLocaleDateString()}</td>
                            <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${pay.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {pay.status}
                                </span>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
    {icon}
    <span className="font-semibold">{label}</span>
  </div>
);

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <div className={`text-3xl font-black ${color.split(' ')[1]}`}>{value}</div>
  </div>
);

export default AdminDashboard;
