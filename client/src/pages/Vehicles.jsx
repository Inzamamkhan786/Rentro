import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import { Search, MapPin, Fuel, ChevronLeft, ChevronRight, SlidersHorizontal, X, Car } from 'lucide-react';

function VehicleCard({ vehicle }) {
  const typeEmoji = { car: '🚗', bike: '🏍️', scooter: '🛵' };
  return (
    <Link to={`/vehicles/${vehicle.id}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-gray-400 transition-all duration-300 flex flex-col h-full">
      <div className="h-[200px] bg-gray-50 border-b border-gray-200 flex items-center justify-center relative overflow-hidden">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img src={`http://localhost:5000${vehicle.images[0]}`} alt={vehicle.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[4rem]">{typeEmoji[vehicle.type] || '🚗'}</span>
        )}
        {vehicle.verified && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider shadow-sm">✓ Verified</div>
        )}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white text-gray-900 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider shadow-sm">{vehicle.type}</div>
      </div>
      <div className="p-5 pb-6 flex-1 flex flex-col">
        <h3 className="text-[1.1rem] font-[700] mb-1.5 leading-[1.3] text-gray-900">{vehicle.title}</h3>
        <p className="text-[0.8rem] text-gray-500 flex items-center gap-1 mb-3">
          <MapPin size={14} /> <span className="truncate">{vehicle.location}</span>
        </p>
        <div className="flex gap-2 flex-wrap mb-4">
          {vehicle.brand && <span className="text-[0.78rem] text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">{vehicle.brand}</span>}
          {vehicle.year && <span className="text-[0.78rem] text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">{vehicle.year}</span>}
          {vehicle.specs?.fuel && <span className="text-[0.78rem] text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md flex items-center gap-1"><Fuel size={12} />{vehicle.specs.fuel}</span>}
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-[1.4rem] font-[800] text-gray-700">₹{vehicle.pricePerHour}</span>
            <span className="text-[0.8rem] text-gray-500">/hr</span>
          </div>
          <div className="text-right">
            <span className="text-[1rem] font-[700] text-gray-600">₹{vehicle.pricePerDay}</span>
            <span className="text-[0.75rem] text-gray-500">/day</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    location: searchParams.get('location') || '',
    minPrice: '', maxPrice: '',
    search: searchParams.get('search') || '',
  });

  const fetchVehicles = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.search) params.search = filters.search;
      const res = await vehicleAPI.getAll(params);
      setVehicles(res.data.items || []);
      setPagination(res.data.pagination || {});
    } catch { setVehicles([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles(1);
  };

  const clearFilters = () => {
    setFilters({ type: '', location: '', minPrice: '', maxPrice: '', search: '' });
    setTimeout(() => fetchVehicles(1), 0);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <h1 className="text-[2rem] font-[800] mb-2 text-gray-900">
          Browse <span className="text-black font-black">Vehicles</span>
        </h1>
        <p className="text-gray-500">Find the perfect ride for your next trip</p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="animate-fade-in stagger-1 bg-white border border-gray-200 rounded-xl shadow-sm flex gap-3 p-4 mb-8 flex-wrap items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 placeholder-gray-400 transition-all" placeholder="Search vehicles..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="w-[140px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 transition-all appearance-none cursor-pointer" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="car">Cars</option>
          <option value="bike">Bikes</option>
          <option value="scooter">Scooters</option>
        </select>
        <button type="submit" className="inline-flex items-center justify-center gap-2 px-7 py-3 text-[0.95rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5">
          <Search size={16} /> Search
        </button>
        <button type="button" onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center justify-center gap-2 px-7 py-3 text-[0.95rem] font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={16} /> Filters
        </button>
      </form>

      {/* Extended Filters */}
      {showFilters && (
        <div className="animate-fade-in bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6 flex gap-4 flex-wrap items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
            <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em]">Location</label>
            <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 placeholder-gray-400" placeholder="e.g. Mumbai" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em]">Min Price/Day</label>
            <input type="number" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 placeholder-gray-400" placeholder="₹500" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em]">Max Price/Day</label>
            <input type="number" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 placeholder-gray-400" placeholder="₹5000" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
          </div>
          <button onClick={clearFilters} className="inline-flex items-center justify-center gap-2 px-4 py-3 text-[0.85rem] font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <X size={14} /> Clear
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm text-center py-20 px-5">
          <Car size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-[1.2rem] font-[700] mb-2 text-gray-900">No vehicles found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((v, i) => (
              <div key={v.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button onClick={() => fetchVehicles(pagination.page - 1)} disabled={!pagination.hasPrev} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200">
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-gray-500 text-[0.9rem] font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button onClick={() => fetchVehicles(pagination.page + 1)} disabled={!pagination.hasNext} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
