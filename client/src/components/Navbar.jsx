import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="w-full max-w-[1280px] mx-auto px-5 flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-gray-900 rounded-[10px] p-2 flex">
            <Car size={22} className="text-white" />
          </div>
          <span className="text-[1.4rem] font-[800] tracking-tight text-gray-900">
            Rent<span className="font-normal">ora</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/vehicles" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">Browse</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-2">
                  <div className="w-[34px] h-[34px] rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-900">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-500">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">Login</Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-2">
          <Link to="/vehicles" className="inline-flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>Browse Vehicles</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="inline-flex justify-start items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-red-500 hover:bg-red-50 transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="inline-flex justify-center items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all" onClick={() => setOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
