import { Car, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstagramIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20">
      <div className="w-full max-w-[1280px] mx-auto px-5 pt-12 pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="bg-gray-900 rounded-[10px] p-2 flex">
              <Car size={20} className="text-white" />
            </div>
            <span className="text-[1.3rem] font-[800] text-gray-900">
              Rent<span className="font-normal">ora</span>
            </span>
          </div>
          <p className="text-gray-500 text-[0.9rem] leading-[1.7]">
            The modern vehicle rental marketplace. Connect, rent, and ride with confidence.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[0.9rem] uppercase tracking-[0.06em] text-gray-500">Platform</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/vehicles" className="text-gray-500 text-[0.9rem] hover:text-gray-900 transition-colors">Browse Vehicles</Link>
            <Link to="/register" className="text-gray-500 text-[0.9rem] hover:text-gray-900 transition-colors">Become a Provider</Link>
            <Link to="/support" className="text-gray-500 text-[0.9rem] hover:text-gray-900 transition-colors">Help & Support</Link>
            <Link to="/" className="text-gray-500 text-[0.9rem] hover:text-gray-900 transition-colors">How it Works</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[0.9rem] uppercase tracking-[0.06em] text-gray-500">Legal</h4>
          <div className="flex flex-col gap-2.5">
            <span className="text-gray-500 text-[0.9rem] hover:text-gray-900 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="text-gray-500 text-[0.9rem] hover:text-gray-900 transition-colors cursor-pointer">Terms of Service</span>
            <span className="text-gray-500 text-[0.9rem] hover:text-gray-900 transition-colors cursor-pointer">Refund Policy</span>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[0.9rem] uppercase tracking-[0.06em] text-gray-500">Connect</h4>
          <div className="flex gap-3">
            <a href="YOUR_INSTAGRAM_LINK_HERE" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all">
              <InstagramIcon size={18} className="text-gray-500 hover:text-[#E1306C] transition-colors" />
            </a>
            <a href="YOUR_X_LINK_HERE" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all">
              <TwitterIcon size={18} className="text-gray-500 hover:text-black transition-colors" />
            </a>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=haquemdinzamamul3@gmail.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all">
              <Mail size={18} className="text-gray-500 hover:text-[#EA4335] transition-colors" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 py-5 text-center text-gray-500 text-[0.8rem]">
        © 2026 Rentora. All rights reserved.
      </div>
    </footer>
  );
}
