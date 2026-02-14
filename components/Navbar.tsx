import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Analytics } from '../lib/analytics';

// Helper function to scroll to a section
export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

interface NavbarProps {
  onCycleBg?: () => void;
  bgVariant?: number;
  bgIntensity?: number;
  onBgIntensityChange?: (value: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCycleBg, bgVariant, bgIntensity, onBgIntensityChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetEarlyAccess = () => {
    Analytics.checkoutModalOpened('nav');
    if (location.pathname !== '/') {
      // Navigate to home first, then scroll
      navigate('/?scroll=pricing');
    } else {
      // Already on home, just scroll
      scrollToSection('pricing');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 pointer-events-none"
      style={{ paddingTop: 'env(safe-area-inset-top, 1.5rem)' }}
    >
      {/* Logo */}
      <Link to="/" className="pointer-events-auto">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-lg"
        >
          <img
            src="/Logo/vois-logo.svg"
            alt="Vois"
            className="h-8 w-8"
          />
          <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
        </motion.div>
      </Link>
      
      {/* Right Side Navigation */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Mobile Download Button — visible only below sm */}
        <motion.a
          href="https://apps.apple.com/app/vois"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="sm:hidden flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-lg hover:bg-white transition-colors"
        >
          <Download size={18} className="text-slate-900" />
          <span className="font-semibold text-sm tracking-tight text-slate-900">Download</span>
        </motion.a>

        {/* Vois for Work Link — full page nav to avoid Three.js teardown blocking */}
        <a
          href="/work"
          className="hidden sm:block text-sm font-light tracking-wide text-blue-700 bg-blue-50/80 backdrop-blur-md hover:bg-blue-50/90 transition-all px-6 py-2.5 rounded-full shadow-lg border border-blue-100"
        >
          Vois for Work
        </a>

        {/* Get Started Button - unified CTA for both plans and login */}
        <motion.button
          onClick={handleGetEarlyAccess}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hidden sm:block relative px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 bg-slate-900/90 backdrop-blur-md hover:bg-slate-900 text-white border border-slate-700"
        >
          Get Started
        </motion.button>
      </div>

    </motion.nav>
  );
};
