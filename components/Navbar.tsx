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
      style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
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
        {/* Mobile menu toggle — visible only below sm */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md border border-slate-100 shadow-lg"
        >
          <Menu size={18} />
        </button>

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

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden absolute top-6 right-6 flex flex-col gap-2 pointer-events-auto"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            {/* Get Started pill with X button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <X size={14} className="text-slate-600" />
              </button>
              <button
                onClick={() => {
                  handleGetEarlyAccess();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 px-5 py-3 text-sm font-medium text-slate-700 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-colors text-left"
              >
                Get Started
              </button>
            </div>

            {/* Log In pill */}
            <a
              href={`${import.meta.env.VITE_WEB_APP_URL || 'https://app.tryvois.com'}/login`}
              className="block px-5 py-3 text-sm font-medium text-slate-700 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-colors text-left ml-10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log In
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
