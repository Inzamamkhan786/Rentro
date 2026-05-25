import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="w-full max-w-[1280px] mx-auto px-5 flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/chatgpt-logo.png" alt="Rentora Logo" className="h-16 w-auto object-contain" />
          <span className="text-[1.4rem] font-[800] tracking-tight text-gray-900 dark:text-white">
            Rent<span className="font-normal">ora</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/vehicles" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Browse</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/support" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Support
              </Link>
              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-2">
                  <div className="w-[34px] h-[34px] rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Login</Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm transition-all hover:-translate-y-0.5">Get Started</Link>
            </>
          )}
          
          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="ml-2 inline-flex items-center justify-center w-[38px] h-[38px] rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className="inline-flex items-center justify-center w-[38px] h-[38px] rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 px-2 py-2 text-sm font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <Link to="/vehicles" className="inline-flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setOpen(false)}>Browse Vehicles</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/support" className="inline-flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setOpen(false)}>Support</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="inline-flex justify-start items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="inline-flex justify-center items-center gap-2 px-4 py-3 text-base font-semibold rounded-lg text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm transition-all" onClick={() => setOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
