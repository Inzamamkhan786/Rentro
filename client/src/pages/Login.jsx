import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full blur-[60px]" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.03), transparent 70%)' }} />
      <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full blur-[60px]" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.03), transparent 70%)' }} />

      <div className="animate-fade-in bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-[440px] px-9 py-12 relative z-10">
        <div className="text-center mb-9">
          <h1 className="text-[1.8rem] font-[800] mb-2">Welcome <span className="text-black font-black">Back</span></h1>
          <p className="text-gray-500 text-[0.9rem]">Sign in to access your Rentora account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-red-500 text-[0.85rem]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em]">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 placeholder-gray-400" 
                placeholder="you@example.com" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em]">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPw ? 'text' : 'password'} 
                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 placeholder-gray-400" 
                placeholder="••••••••" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPw(!showPw)} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 w-full px-9 py-4 mt-2 text-[1.05rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
            {loading ? <span className="w-5 h-5 border-[3px] border-gray-500 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="text-center mt-7 text-gray-500 text-[0.9rem]">
          Don't have an account? <Link to="/register" className="text-gray-700 font-semibold hover:text-black">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
