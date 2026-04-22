import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Fuel, Users, Calendar, Shield, ArrowLeft, Star, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ startDate: '', endDate: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    vehicleAPI.getById(id)
      .then(res => setVehicle(res.data))
      .catch(() => navigate('/vehicles'))
      .finally(() => setLoading(false));
  }, [id]);

  const calcPrice = () => {
    if (!booking.startDate || !booking.endDate || !vehicle) return null;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    if (hours <= 0) return null;
    if (hours < 24) return { price: hours * vehicle.pricePerHour, unit: `${hours} hrs`, type: 'hourly' };
    const days = Math.ceil(hours / 24);
    return { price: days * vehicle.pricePerDay, unit: `${days} days`, type: 'daily' };
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    if (user.role !== 'consumer') return;
    
    setBookingLoading(true); setMsg({});
    try {
      await bookingAPI.create({ 
        vehicleId: parseInt(id), 
        startDate: new Date(booking.startDate).toISOString(), 
        endDate: new Date(booking.endDate).toISOString() 
      });
      setMsg({ type: 'success', text: 'Booking created successfully! Check your dashboard.' });
    } catch (err) {
      const errMsg = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
      setMsg({ type: 'error', text: errMsg || 'Booking failed' });
    } finally { setBookingLoading(false); }
  };

  const typeEmoji = { car: '🚗', bike: '🏍️', scooter: '🛵' };
  const priceCalc = calcPrice();

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  if (!vehicle) return null;

  const hasImages = vehicle.images && vehicle.images.length > 0;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center gap-2 px-4 py-2 mb-6 text-[0.85rem] font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors animate-fade-in">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left: Vehicle Info */}
        <div className="animate-fade-in">
          
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl h-[360px] md:h-[460px] flex items-center justify-center relative overflow-hidden mb-3">
              {hasImages ? (
                <img src={`http://localhost:5000${vehicle.images[activeImage]}`} alt={vehicle.title} className="w-full h-full object-cover transition-opacity duration-300" />
              ) : (
                <span className="text-[8rem]">{typeEmoji[vehicle.type] || '🚗'}</span>
              )}
              {vehicle.verified && <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"><CheckCircle size={14} /> Verified</div>}
            </div>
            
            {hasImages && vehicle.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {vehicle.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 transition-all ${activeImage === idx ? 'ring-2 ring-black ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <img src={`http://localhost:5000${img}`} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Location */}
          <h1 className="text-[1.8rem] font-[800] mb-2 text-gray-900">{vehicle.title}</h1>
          <div className="flex items-center gap-4 flex-wrap mb-6 text-gray-500 text-[0.9rem]">
            <span className="flex items-center gap-1"><MapPin size={16} /> {vehicle.location}</span>
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{vehicle.type}</span>
            {vehicle.brand && <span>{vehicle.brand} {vehicle.model}</span>}
            {vehicle.year && <span>• {vehicle.year}</span>}
          </div>

          {/* Specs Grid */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-[700] mb-4 text-[1rem] text-gray-900">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {vehicle.specs?.fuel && (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[10px] bg-gray-50 border border-gray-200 flex items-center justify-center"><Fuel size={18} className="text-gray-900" /></div>
                  <div><div className="text-[0.75rem] text-gray-500">Fuel</div><div className="font-[600] text-[0.9rem] text-gray-900">{vehicle.specs.fuel}</div></div>
                </div>
              )}
              {vehicle.specs?.seats && (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[10px] bg-gray-50 border border-gray-200 flex items-center justify-center"><Users size={18} className="text-gray-900" /></div>
                  <div><div className="text-[0.75rem] text-gray-500">Seats</div><div className="font-[600] text-[0.9rem] text-gray-900">{vehicle.specs.seats}</div></div>
                </div>
              )}
              {vehicle.specs?.transmission && (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[10px] bg-gray-50 border border-gray-200 flex items-center justify-center"><Star size={18} className="text-gray-900" /></div>
                  <div><div className="text-[0.75rem] text-gray-500">Transmission</div><div className="font-[600] text-[0.9rem] text-gray-900">{vehicle.specs.transmission}</div></div>
                </div>
              )}
            </div>
            
            {vehicle.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-[700] mb-3 text-[1rem] text-gray-900">Description</h3>
                <p className="text-gray-600 text-[0.95rem] leading-relaxed whitespace-pre-line">{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Owner Info */}
          {vehicle.owner && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="font-[700] mb-4 text-[1rem] text-gray-900">Owner</h3>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-[700] text-gray-900 text-lg">
                  {vehicle.owner.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-[600] text-gray-900">{vehicle.owner.name}</div>
                  <div className="text-[0.8rem] text-gray-500">Member since 2024</div>
                </div>
              </div>
            </div>
          )}

          {/* Location Map */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
            <h3 className="font-[700] mb-4 text-[1rem] text-gray-900 flex items-center gap-2">
              <MapPin size={18} /> Location
            </h3>
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                className="border-0 block"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(vehicle.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
                title="Google Map Location"
              ></iframe>
            </div>
            <p className="mt-3 text-[0.85rem] text-gray-500">
              {vehicle.location}
            </p>
          </div>
        </div>

        {/* Right: Booking Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-7 sticky top-[96px] animate-fade-in stagger-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-[2rem] font-[800] text-gray-700 leading-none mb-1">₹{vehicle.pricePerHour}</div>
              <div className="text-[0.8rem] text-gray-500">per hour</div>
            </div>
            <div className="text-right">
              <div className="text-[1.3rem] font-[700] text-gray-600 leading-none mb-1">₹{vehicle.pricePerDay}</div>
              <div className="text-[0.8rem] text-gray-500">per day</div>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center mb-4">
              <p className="text-gray-600 text-[0.9rem] mb-3">Please log in to book this vehicle</p>
              <Link to="/login" className="inline-flex items-center justify-center w-full px-4 py-2.5 text-[0.95rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 transition-all">Login to Book</Link>
            </div>
          ) : user.role !== 'consumer' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center mb-4">
              <Shield size={24} className="mx-auto text-amber-500 mb-2" />
              <h4 className="font-bold text-amber-700 mb-1">Provider Account</h4>
              <p className="text-amber-600 text-[0.85rem]">Only consumers can book vehicles. Please log in with a consumer account to make a booking.</p>
            </div>
          ) : (
            <form onSubmit={handleBook} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em] flex items-center"><Calendar size={14} className="mr-1" /> Start Date & Time</label>
                <input type="datetime-local" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 transition-all" value={booking.startDate} onChange={(e) => setBooking({ ...booking, startDate: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em] flex items-center"><Calendar size={14} className="mr-1" /> End Date & Time</label>
                <input type="datetime-local" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 transition-all" value={booking.endDate} onChange={(e) => setBooking({ ...booking, endDate: e.target.value })} required />
              </div>

              {priceCalc && (
                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                  <div className="flex justify-between mb-2 text-[0.85rem] text-gray-500">
                    <span>Duration</span><span>{priceCalc.unit}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-[0.85rem] text-gray-500">
                    <span>Rate ({priceCalc.type})</span><span>₹{priceCalc.type === 'hourly' ? vehicle.pricePerHour : vehicle.pricePerDay}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-[700] text-[1.1rem]">
                    <span className="text-gray-900">Total</span><span className="text-gray-700">₹{priceCalc.price.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {msg.text && (
                <div className={`border rounded-lg px-3.5 py-2.5 text-[0.85rem] mt-2 ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-500'}`}>
                  {msg.text}
                </div>
              )}

              <button type="submit" disabled={bookingLoading || !vehicle.availability} className="inline-flex items-center justify-center gap-2 w-full px-9 py-4 mt-2 text-[1.05rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                {bookingLoading ? <span className="w-5 h-5 border-[3px] border-gray-500 border-t-white rounded-full animate-spin" /> : vehicle.availability ? 'Book Now' : 'Currently Unavailable'}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-[0.8rem]">
            <Shield size={14} /> Secure booking with instant confirmation
          </div>
        </div>
      </div>
    </div>
  );
}
