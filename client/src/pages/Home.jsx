import { Link } from 'react-router-dom';
import { Car, Shield, Zap, Clock, ArrowRight, Star, MapPin, Users, ChevronRight } from 'lucide-react';

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '5K+', label: 'Vehicles Listed' },
  { value: '50K+', label: 'Trips Completed' },
  { value: '4.9', label: 'Average Rating' },
];

const features = [
  { icon: Shield, title: 'Verified Vehicles', desc: 'Every vehicle goes through document verification including RC and PUC checks.' },
  { icon: Zap, title: 'Instant Booking', desc: 'Browse, select, and book your ride in under 2 minutes with real-time availability.' },
  { icon: Clock, title: 'Flexible Duration', desc: 'Rent by the hour or by the day. Pay only for the time you actually need.' },
];

const vehicleTypes = [
  { type: 'Cars', emoji: '🚗', count: '2,500+', gradient: 'bg-gray-50', textCol: 'text-gray-900' },
  { type: 'Bikes', emoji: '🏍️', count: '1,800+', gradient: 'bg-gray-50', textCol: 'text-gray-900' },
  { type: 'Scooters', emoji: '🛵', count: '900+', gradient: 'bg-gray-50', textCol: 'text-gray-900' },
];

const steps = [
  { num: '01', title: 'Sign Up', desc: 'Create your account and verify your identity with your driving license.' },
  { num: '02', title: 'Browse & Book', desc: 'Explore thousands of vehicles, compare prices, and book instantly.' },
  { num: '03', title: 'Ride & Return', desc: 'Pick up your vehicle, enjoy the ride, and return when done.' },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-[100px]">
        {/* Background effects */}
        <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full blur-[60px]" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.03), transparent 70%)' }} />
        <div className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] rounded-full blur-[60px]" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.03), transparent 70%)' }} />

        <div className="w-full max-w-[1280px] mx-auto px-5 relative z-10">
          <div className="max-w-[720px] mx-auto text-center">
            <div className="animate-fade-in mb-5">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Star size={14} /> #1 Vehicle Rental Platform
              </span>
            </div>
            <h1 className="animate-fade-in stagger-1 text-[clamp(2.5rem,6vw,4.2rem)] font-black leading-[1.08] tracking-[-0.03em] mb-6">
              Your Next Ride is
              <br />
              <span className="text-black font-black">Just a Click Away</span>
            </h1>
            <p className="animate-fade-in stagger-2 text-[1.15rem] text-gray-500 max-w-[540px] mx-auto mb-10 leading-[1.7]">
              Discover thousands of verified vehicles from trusted owners. Book cars, bikes, and scooters at the best prices with instant confirmation.
            </p>
            <div className="animate-fade-in stagger-3 flex gap-4 justify-center flex-wrap">
              <Link to="/vehicles" className="inline-flex items-center justify-center gap-2 px-9 py-4 text-[1.05rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5">
                Browse Vehicles <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-9 py-4 text-[1.05rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-px">
                List Your Vehicle
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="animate-slide-up stagger-4 max-w-[800px] mx-auto mt-[60px] grid grid-cols-2 md:grid-cols-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {stats.map((s, i) => (
              <div key={i} className="p-6 text-center">
                <div className="text-[1.8rem] font-[800] text-gray-700">{s.value}</div>
                <div className="text-[0.8rem] text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VEHICLE TYPES */}
      <section className="w-full max-w-[1280px] mx-auto px-5 py-[60px]">
        <div className="text-center mb-12">
          <h2 className="text-[2.2rem] font-[800] tracking-[-0.02em] mb-3">
            Find Your Perfect <span className="text-black font-black">Ride</span>
          </h2>
          <p className="text-gray-500 max-w-[480px] mx-auto">Choose from our diverse fleet of verified vehicles</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {vehicleTypes.map((v, i) => (
            <Link to={`/vehicles?type=${v.type.toLowerCase().slice(0, -1)}`} key={i} className="animate-fade-in bg-white border border-gray-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-gray-400 transition-all duration-300 p-8 text-center cursor-pointer" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-[3.5rem] mb-4">{v.emoji}</div>
              <h3 className="text-[1.3rem] font-[700] mb-2">{v.type}</h3>
              <div className={`inline-block ${v.gradient} px-3.5 py-1 rounded-full text-[0.8rem] font-[600] ${v.textCol}`}>{v.count}</div>
              <div className="mt-4 text-gray-900 text-[0.9rem] font-[600] flex items-center justify-center gap-1.5">
                Explore <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-[80px] bg-gray-50">
        <div className="w-full max-w-[1280px] mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-[2.2rem] font-[800] tracking-[-0.02em] mb-3">
              Why Choose <span className="text-black font-black">Rentora</span>?
            </h2>
            <p className="text-gray-500 max-w-[480px] mx-auto">Built for trust, speed, and convenience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="animate-fade-in bg-white border border-gray-200 rounded-xl shadow-sm p-9" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-[52px] h-[52px] rounded-xl bg-gray-900 flex items-center justify-center mb-5 shadow-sm">
                  <f.icon size={24} color="#fff" />
                </div>
                <h3 className="text-[1.15rem] font-[700] mb-2.5">{f.title}</h3>
                <p className="text-gray-500 text-[0.9rem] leading-[1.7]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full max-w-[1280px] mx-auto px-5 py-[80px]">
        <div className="text-center mb-14">
          <h2 className="text-[2.2rem] font-[800] tracking-[-0.02em] mb-3">
            How It <span className="text-black font-black">Works</span>
          </h2>
          <p className="text-gray-500 max-w-[480px] mx-auto">Get on the road in three simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="animate-fade-in relative px-2" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="text-[4rem] font-[900] text-gray-100 mb-[-16px] leading-[1]">{s.num}</div>
              <h3 className="text-[1.2rem] font-[700] mb-2.5 relative">{s.title}</h3>
              <p className="text-gray-500 text-[0.9rem] leading-[1.7]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-[1280px] mx-auto px-5 pt-[40px] pb-[80px]">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-10 py-16 text-center relative overflow-hidden">
          <div className="absolute -top-[80px] -right-[80px] w-[250px] h-[250px] rounded-full blur-[40px]" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.03), transparent)' }} />
          <h2 className="text-[2rem] font-[800] mb-4 relative">
            Ready to <span className="text-black font-black">Get Started</span>?
          </h2>
          <p className="text-gray-500 mb-8 max-w-[420px] mx-auto relative">
            Join thousands of users who trust Rentora for their mobility needs.
          </p>
          <div className="flex gap-4 justify-center flex-wrap relative">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-9 py-4 text-[1.05rem] font-semibold rounded-lg text-white bg-gray-900 hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5">
              <Users size={18} /> Create Account
            </Link>
            <Link to="/vehicles" className="inline-flex items-center justify-center gap-2 px-9 py-4 text-[1.05rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-px">
              <MapPin size={18} /> Explore Nearby
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
