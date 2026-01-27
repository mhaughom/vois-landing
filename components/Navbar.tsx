import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 pointer-events-none"
      style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
    >
      {/* Logo */}
      <Link to="/" className="pointer-events-auto">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-sm"
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
        {/* Mobile menu toggle — visible only below sm */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Vois for Work Link — full page nav to avoid Three.js teardown blocking */}
        <a
          href="/work"
          className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
        >
          Vois for Work
        </a>

        {/* Login Link */}
        <Link
          to="/login"
          className="hidden sm:block text-sm font-medium text-white bg-black hover:bg-black/80 transition-colors px-6 py-2.5 rounded-full"
        >
          Log In
        </Link>

        {/* Get Early Access Button - Soft pastel gradient (hidden on mobile to prevent clipping) */}
        <motion.button
          onClick={handleGetEarlyAccess}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:block relative px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 overflow-hidden border border-violet-200"
          style={{
            background: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 50%, #bfdbfe 100%)',
          }}
        >
          {/* Subtle animated shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.3), rgba(165,180,252,0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <span className="relative z-10 text-slate-700 font-semibold">Get Early Access</span>
        </motion.button>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden absolute top-full right-6 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-lg overflow-hidden pointer-events-auto"
          >
            <a
              href="/work"
              className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vois for Work
            </a>
            <Link
              to="/login"
              className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log In
            </Link>
            {onCycleBg && (
              <div className="border-t border-slate-100">
                <button
                  onClick={onCycleBg}
                  className="block w-full text-left px-5 py-3 text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  BG Variant: {(bgVariant ?? 0) + 1}/8
                </button>
                {onBgIntensityChange && (
                  <div className="px-5 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Intensity</span>
                      <span className="text-xs font-mono text-violet-600">{Math.round((bgIntensity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={Math.round((bgIntensity ?? 1) * 100)}
                      onChange={(e) => onBgIntensityChange(Number(e.target.value) / 100)}
                      className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-violet-500"
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
