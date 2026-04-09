import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, LayoutDashboard, CreditCard, PackageSearch, Users, RefreshCcw } from 'lucide-react';

const AdminDashboard = ({ logout }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lostData, setLostData] = useState(null);
  const [kuppiData, setKuppiData] = useState(null);
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data with proper error handling
      const itemsPromise = axios.get('http://localhost:5050/api/items').catch(() => ({ data: [] }));
      const kuppiPromise = axios.get('http://localhost:5050/api/kuppi').catch(() => ({ data: [] }));
      const ticketsPromise = axios.get('http://localhost:5050/admin-support/tickets').catch(() => ({ data: {} }));

      const [itemsRes, kuppiRes, ticketsRes] = await Promise.all([itemsPromise, kuppiPromise, ticketsPromise]);

      // Process Lost & Found Items
      try {
        const items = Array.isArray(itemsRes.data) ? itemsRes.data : [];
        const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
        setLostData({
          total:    items.length,
          recent:   items.filter((i) => i.createdAt && new Date(i.createdAt) > week).length,
          lost:     items.filter((i) => i.itemType?.toLowerCase() === 'lost').length,
          found:    items.filter((i) => i.itemType?.toLowerCase() === 'found').length,
          reclaimed: items.filter((i) => i.itemType?.toLowerCase() === 'reclaimed').length,
        });
      } catch (e) {
        console.error('Error processing items:', e);
        setLostData({ total: 0, recent: 0, lost: 0, found: 0, reclaimed: 0 });
      }

      // Process Kuppi Sessions
      try {
        const sessions = Array.isArray(kuppiRes.data) ? kuppiRes.data : [];
        setKuppiData({
          total:    sessions.length,
          pending:  sessions.filter((s) => s.status?.toLowerCase() === 'pending').length,
          approved: sessions.filter((s) => s.status?.toLowerCase() === 'approved').length,
          rejected: sessions.filter((s) => s.status?.toLowerCase() === 'rejected').length,
        });
      } catch (e) {
        console.error('Error processing kuppi:', e);
        setKuppiData({ total: 0, pending: 0, approved: 0, rejected: 0 });
      }

      // Process Support Tickets
      try {
        const ticketDataRes = ticketsRes.data || {};
        const tickets = Array.isArray(ticketDataRes.tickets) ? ticketDataRes.tickets : [];
        setTicketData({
          total:    tickets.length,
          open:     tickets.filter((t) => t.status?.toLowerCase() === 'open').length,
          resolved: tickets.filter((t) => t.status?.toLowerCase() === 'resolved').length,
          pending:  tickets.filter((t) => t.status?.toLowerCase() === 'pending').length,
        });
      } catch (e) {
        console.error('Error processing tickets:', e);
        setTicketData({ total: 0, open: 0, resolved: 0, pending: 0 });
      }
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

        {/* Module Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Lost & Found Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm">
            <h4 className="text-sm font-bold text-blue-600 uppercase mb-4">📦 Lost & Found</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Total Items</span>
                <span className="text-2xl font-bold text-blue-700">{lostData?.total ?? 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
                <div>
                  <p className="text-xs text-slate-500">Lost</p>
                  <p className="text-lg font-bold text-slate-700">{lostData?.lost ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Found</p>
                  <p className="text-lg font-bold text-slate-700">{lostData?.found ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kuppi Sessions Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm">
            <h4 className="text-sm font-bold text-purple-600 uppercase mb-4">👥 Kuppi Sessions</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Total Sessions</span>
                <span className="text-2xl font-bold text-purple-700">{kuppiData?.total ?? 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200">
                <div>
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="text-lg font-bold text-slate-700">{kuppiData?.pending ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Approved</p>
                  <p className="text-lg font-bold text-slate-700">{kuppiData?.approved ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Tickets Summary */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl border border-rose-200 shadow-sm">
            <h4 className="text-sm font-bold text-rose-600 uppercase mb-4">🎫 Support Tickets</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Total Tickets</span>
                <span className="text-2xl font-bold text-rose-700">{ticketData?.total ?? 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-200">
                <div>
                  <p className="text-xs text-slate-500">Open</p>
                  <p className="text-lg font-bold text-slate-700">{ticketData?.open ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Resolved</p>
                  <p className="text-lg font-bold text-slate-700">{ticketData?.resolved ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
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
                {payments.length === 0 ? (
                    <tr><td colSpan="4" className="py-10 text-center text-slate-500">No payments recorded</td></tr>
                ) : (
                    payments.slice(0, 5).map((pay) => (
                        <tr key={pay._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-semibold">{pay.userId || 'N/A'}</td>
                            <td className="py-4 px-4 font-bold text-slate-900">${pay.amount || 0}</td>
                            <td className="py-4 px-4 text-slate-500 text-sm">{pay.createdAt ? new Date(pay.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${pay.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {pay.status || 'pending'}
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
