import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, vehicleAPI, paymentAPI, documentAPI, adminAPI } from '../services/api';
import BookingChatModal from '../components/BookingChatModal';
import { Car, Calendar, IndianRupee, FileCheck, Users, BarChart3, Plus, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Shield, MessageCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in p-6" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
          <Icon size={22} className="text-gray-900" />
        </div>
        <div>
          <div className="text-[0.8rem] text-gray-500 mb-0.5">{label}</div>
          <div className="text-[1.5rem] font-[800] text-gray-900 leading-none">{value}</div>
        </div>
      </div>
    </div>
  );
}

const statusColors = { 
  pending: 'bg-amber-50 text-amber-600', 
  confirmed: 'bg-gray-100 text-gray-700', 
  active: 'bg-emerald-50 text-emerald-600', 
  completed: 'bg-emerald-50 text-emerald-600', 
  cancelled: 'bg-red-50 text-red-600' 
};

function BookingRow({ booking, role, onUpdate }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-200 gap-3 flex-wrap last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-[180px]">
        <div className="w-10 h-10 rounded-[10px] bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
          <Car size={18} className="text-gray-900" />
        </div>
        <div>
          <div className="font-[600] text-[0.9rem] text-gray-900">{booking.vehicle?.title || `Booking #${booking.id}`}</div>
          <div className="text-[0.78rem] text-gray-500">
            {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-[700] text-gray-700">₹{parseFloat(booking.totalPrice).toLocaleString()}</span>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${statusColors[booking.status] || 'bg-gray-100 text-gray-500'}`}>{booking.status}</span>
        
        {['confirmed', 'active', 'completed'].includes(booking.status) && (
          <button onClick={() => onChat(booking)} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 ml-1 text-[0.75rem] font-bold rounded-md text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-black shadow-sm transition-all">
            <MessageCircle size={14} /> Chat
          </button>
        )}

        {role === 'provider' && booking.status === 'pending' && (
          <div className="flex gap-1.5 ml-2">
            <button onClick={() => onUpdate(booking.id, 'confirmed')} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[0.75rem] font-semibold rounded-md text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-[1px]">Accept</button>
            <button onClick={() => onUpdate(booking.id, 'cancelled')} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[0.75rem] font-semibold rounded-md text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-[1px]">Decline</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  const handleBookingUpdate = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, { status });
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      // Refresh stats
      const bStats = await bookingAPI.getStats();
      setStats(bStats.data || {});
    } catch (e) {
      alert(e.message || 'Failed to update booking');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const bStats = await bookingAPI.getStats();
        setStats(bStats.data || {});

        if (user.role === 'consumer') {
          const bRes = await bookingAPI.getMy({ limit: 5 });
          setBookings(bRes.data?.items || []);
        }
        if (user.role === 'provider') {
          const vRes = await vehicleAPI.getMyListings();
          setVehicles(vRes.data || []);
          const bRes = await bookingAPI.getProvider({ limit: 5 });
          setBookings(bRes.data?.items || []);
        }
        if (user.role === 'admin') {
          const adminRes = await adminAPI.getDashboard();
          setAdminStats(adminRes.data);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      {/* Header */}
      <div className="animate-fade-in flex justify-between items-center flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-[1.8rem] font-[800] mb-1 text-gray-900">
            Hello, <span className="text-black font-black">{user.name}</span> 👋
          </h1>
          <p className="text-gray-500">
            {user.role === 'consumer' ? 'Manage your bookings and documents' : user.role === 'provider' ? 'Manage your fleet and earnings' : 'Platform administration'}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[0.8rem] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-50 text-red-600' : user.role === 'provider' ? 'bg-gray-100 text-gray-700' : 'bg-emerald-50 text-emerald-600'}`}>
            {user.role}
          </span>
          {user.verified && <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[0.8rem] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600"><Shield size={14} /> Verified</span>}
        </div>
      </div>

      {/* Stats */}
      {user.role === 'admin' && adminStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={adminStats.totalUsers} color="#111827" delay={0} />
          <StatCard icon={Car} label="Total Vehicles" value={adminStats.totalVehicles} color="#111827" delay={0.1} />
          <StatCard icon={Calendar} label="Total Bookings" value={adminStats.totalBookings} color="#111827" delay={0.2} />
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(adminStats.totalRevenue || 0).toLocaleString()}`} color="#111827" delay={0.3} />
          <StatCard icon={AlertCircle} label="Pending Verifications" value={adminStats.pendingVerifications} color="#111827" delay={0.4} />
          <StatCard icon={TrendingUp} label="Active Bookings" value={adminStats.activeBookings} color="#111827" delay={0.5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar} label="Total Bookings" value={stats.total || 0} color="#111827" delay={0} />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completed || 0} color="#111827" delay={0.1} />
          <StatCard icon={Clock} label="Active" value={(stats.active || 0) + (stats.confirmed || 0)} color="#111827" delay={0.2} />
          <StatCard icon={IndianRupee} label="Total Spent" value={`₹${(stats.totalSpent || 0).toLocaleString()}`} color="#111827" delay={0.3} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {['overview', user.role === 'provider' ? 'vehicles' : null, 'bookings'].filter(Boolean).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-md border-none cursor-pointer font-semibold text-[0.85rem] transition-all duration-200 capitalize whitespace-nowrap ${tab === t ? 'bg-black text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6">
          {/* Recent Bookings */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-[700] text-gray-900">Recent Bookings</h3>
              <button onClick={() => setTab('bookings')} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-[0.8rem] font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">View All →</button>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                <Calendar size={32} className="mb-2 opacity-50" />
                <p>No bookings yet</p>
                {user.role === 'consumer' && <Link to="/vehicles" className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-3 text-[0.85rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-px">Browse Vehicles</Link>}
              </div>
            ) : bookings.slice(0, 4).map(b => <BookingRow key={b.id} booking={b} role={user.role} onUpdate={handleBookingUpdate} onChat={setActiveChatBooking} />)}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in stagger-1 p-6 h-fit">
            <h3 className="font-[700] mb-4 text-gray-900">Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              {user.role === 'consumer' && (
                <>
                  <Link to="/vehicles" className="inline-flex items-center justify-start gap-2 px-4 py-3 text-[0.95rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-[1px]"><Car size={18} className="text-gray-500" /> Browse Vehicles</Link>
                  <Link to="/dashboard/documents" className="inline-flex items-center justify-start gap-2 px-4 py-3 text-[0.95rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-[1px]"><FileCheck size={18} className="text-gray-500" /> Upload Documents</Link>
                </>
              )}
              {user.role === 'provider' && (
                <>
                  <Link to="/dashboard/add-vehicle" className="inline-flex items-center justify-start gap-2 px-4 py-3 text-[0.95rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-[1px]"><Plus size={18} /> Add New Vehicle</Link>
                  <Link to="/dashboard/earnings" className="inline-flex items-center justify-start gap-2 px-4 py-3 text-[0.95rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-[1px]"><BarChart3 size={18} className="text-gray-500" /> View Earnings</Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/dashboard/users" className="inline-flex items-center justify-start gap-2 px-4 py-3 text-[0.95rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-[1px]"><Users size={18} className="text-gray-500" /> Manage Users</Link>
                  <Link to="/dashboard/verifications" className="inline-flex items-center justify-start gap-2 px-4 py-3 text-[0.95rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-[1px]"><FileCheck size={18} className="text-gray-500" /> Pending Verifications</Link>
                  <Link to="/dashboard/support" className="inline-flex items-center justify-start gap-2 px-4 py-3 text-[0.95rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-[1px]"><AlertCircle size={18} className="text-gray-500" /> Support Tickets</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vehicles Tab (Provider) */}
      {tab === 'vehicles' && user.role === 'provider' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-[700] text-gray-900">My Vehicles ({vehicles.length})</h3>
            <Link to="/dashboard/add-vehicle" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-px"><Plus size={16} /> Add Vehicle</Link>
          </div>
          {vehicles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm text-center py-16 px-5 flex flex-col items-center">
              <Car size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500">You haven't listed any vehicles yet</p>
              <Link to="/dashboard/add-vehicle" className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-4 text-[0.85rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-px"><Plus size={16} /> List Your First Vehicle</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-[1.8rem] shrink-0 overflow-hidden">
                    {v.images && v.images.length > 0 ? (
                      <img src={`http://localhost:5000${v.images[0]}`} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      v.type === 'car' ? '🚗' : v.type === 'bike' ? '🏍️' : '🛵'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-[600] text-gray-900 mb-1 truncate">{v.title}</div>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${v.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{v.verified ? 'Verified' : 'Pending'}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${v.availability ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{v.availability ? 'Available' : 'Unavailable'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="font-[700] text-gray-700 whitespace-nowrap">₹{v.pricePerDay}/d</div>
                    <Link to={`/dashboard/edit-vehicle/${v.id}`} className="text-[0.75rem] font-bold text-gray-500 hover:text-black hover:underline transition-colors">Edit →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in p-6">
          <h3 className="font-[700] mb-4 text-gray-900">All Bookings</h3>
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No bookings found</div>
          ) : bookings.map(b => <BookingRow key={b.id} booking={b} role={user.role} onUpdate={handleBookingUpdate} onChat={setActiveChatBooking} />)}
        </div>
      )}
      {/* Modals */}
      {activeChatBooking && (
        <BookingChatModal booking={activeChatBooking} onClose={() => setActiveChatBooking(null)} />
      )}
    </div>
  );
}
