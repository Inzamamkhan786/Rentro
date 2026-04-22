import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import { IndianRupee, BarChart3, TrendingUp, Calendar, Car } from 'lucide-react';

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

export default function ProviderEarnings() {
  const [data, setData] = useState({ totalEarnings: 0, bookingCount: 0, earnings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await paymentAPI.getEarnings();
        setData(res.data || { totalEarnings: 0, bookingCount: 0, earnings: [] });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      <div className="animate-fade-in mb-8">
        <h1 className="text-[1.8rem] font-[800] mb-1">
          <span className="text-black font-black">Earnings Dashboard</span>
        </h1>
        <p className="text-gray-500">
          Track your revenue and paid bookings across your fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={IndianRupee} label="Total Lifetime Earnings" value={`₹${data.totalEarnings.toLocaleString()}`} color="#111827" delay={0} />
        <StatCard icon={BarChart3} label="Completed Bookings" value={data.bookingCount} color="#111827" delay={0.1} />
        <StatCard icon={TrendingUp} label="Average per Booking" value={`₹${data.bookingCount > 0 ? Math.round(data.totalEarnings / data.bookingCount).toLocaleString() : 0}`} color="#111827" delay={0.2} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in stagger-1 p-6">
        <h3 className="font-[700] mb-5 flex items-center gap-2 text-gray-900 text-[1rem]">
          <Calendar size={18} /> Earnings History
        </h3>
        
        {data.earnings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <IndianRupee size={48} className="mx-auto mb-4 opacity-30" />
            <p>No earnings found yet. Start accepting bookings to see your revenue here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-gray-500 font-[600] whitespace-nowrap">Booking ID</th>
                  <th className="px-4 py-3 text-gray-500 font-[600] whitespace-nowrap">Vehicle</th>
                  <th className="px-4 py-3 text-gray-500 font-[600] whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-gray-500 font-[600] text-right whitespace-nowrap">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.earnings.map((item, idx) => (
                  <tr key={item.bookingId} className={`border-b border-gray-200 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-gray-50'}`}>
                    <td className="px-4 py-4 font-[600] text-gray-900 whitespace-nowrap">#{item.bookingId}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Car size={14} className="text-gray-400" />
                        <span className="text-gray-900">{item.vehicle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 font-[700] text-gray-700 text-right whitespace-nowrap">
                      ₹{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
