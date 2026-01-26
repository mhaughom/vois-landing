import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Calendar, ListTodo, ShoppingCart, Lightbulb,
  Heart, Wallet, Target, Users, ChevronLeft, Watch, Smartphone,
} from 'lucide-react';
import { Analytics } from '../lib/analytics';

const CHECKOUT_API = import.meta.env.VITE_API_URL || 'https://voisbackend-production.up.railway.app';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const QUIZ_CATEGORIES = [
  { id: 'calendar', label: 'Events & Calendar', icon: Calendar,     bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400'   },
  { id: 'tasks',    label: 'Tasks & To-dos',    icon: ListTodo,     bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400'  },
  { id: 'shopping', label: 'Shopping & Lists',   icon: ShoppingCart, bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  { id: 'ideas',    label: 'Ideas & Notes',      icon: Lightbulb,    bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { id: 'health',   label: 'Health & Wellness',   icon: Heart,        bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400'    },
  { id: 'finance',  label: 'Finance & Budget',    icon: Wallet,       bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   text: 'text-cyan-400'   },
  { id: 'goals',    label: 'Goals & Habits',      icon: Target,       bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  { id: 'social',   label: 'People & Social',     icon: Users,        bg: 'bg-pink-500/10',   border: 'border-pink-500/30',   text: 'text-pink-400'   },
];

const QUIZ_DEVICES = [
  { id: 'watch', label: 'Apple Watch', desc: 'Capture on your wrist' },
  { id: 'phone', label: 'iPhone',      desc: 'Always in your pocket' },
  { id: 'both',  label: 'Both',        desc: 'The full experience'   },
];

const stepTransition = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as number[] },
};

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  remaining: number | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, remaining }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSoldOut = remaining === 0;
  const didSubmitRef = useRef(false);

  // Reset all state when modal closes; track abandonment
  useEffect(() => {
    if (!isOpen) {
      if (step > 1 && !didSubmitRef.current) {
        Analytics.checkoutAbandoned(step);
      }
      setStep(1);
      setSelectedCategories(new Set());
      setSelectedDevices(new Set());
      setEmail('');
      setError(null);
      didSubmitRef.current = false;
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDevice = (id: string) => {
    setSelectedDevices(() => {
      const next = new Set<string>();
      next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    Analytics.checkoutEmailEntered();
    setIsLoading(true);
    try {
      const response = await fetch(`${CHECKOUT_API}/api/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.status === 429) {
        const msg = 'Too many attempts. Please wait a moment and try again.';
        setError(msg);
        Analytics.errorOccurred(msg, 'checkout');
        return;
      }
      if (response.status === 410) {
        const msg = "All Founder spots have been claimed. Join the waitlist instead.";
        setError(msg);
        Analytics.errorOccurred(msg, 'checkout');
        return;
      }
      if (response.status === 503) {
        const msg = 'Checkout is temporarily unavailable. Please try again later.';
        setError(msg);
        Analytics.errorOccurred(msg, 'checkout');
        return;
      }
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      didSubmitRef.current = true;
      Analytics.checkoutRedirectToStripe();
      window.location.href = data.url;
    } catch {
      const msg = 'Something went wrong. Please try again.';
      setError(msg);
      Analytics.errorOccurred(msg, 'checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-md bg-slate-950 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-50 pointer-events-none" />

            <div className="relative z-10">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    className={`rounded-full ${
                      s === step
                        ? 'w-2.5 h-2.5 bg-white'
                        : s < step
                        ? 'w-2 h-2 bg-slate-500'
                        : 'w-2 h-2 bg-slate-700'
                    }`}
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                ))}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                {/* ── STEP 1: What would you save? ── */}
                {step === 1 && (
                  <motion.div key="step1" {...stepTransition}>
                    <h2 className="text-2xl font-serif text-white mb-2">What would you save?</h2>
                    <p className="text-slate-400 text-sm mb-5">
                      Pick everything that clutters your mind.
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                      {QUIZ_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategories.has(cat.id);
                        const Icon = cat.icon;
                        return (
                          <motion.button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            whileTap={{ scale: 0.97 }}
                            className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left ${
                              isSelected
                                ? `${cat.bg} ${cat.border} ${cat.text}`
                                : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSelected ? cat.bg : 'bg-slate-800'
                            }`}>
                              <Icon size={16} className={isSelected ? cat.text : 'text-slate-500'} />
                            </div>
                            <span className="text-sm font-medium leading-tight">{cat.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => {
                        Analytics.checkoutStep1Completed(Array.from(selectedCategories));
                        setStep(2);
                      }}
                      disabled={selectedCategories.size === 0}
                      whileHover={{ scale: selectedCategories.size > 0 ? 1.02 : 1 }}
                      whileTap={{ scale: selectedCategories.size > 0 ? 0.98 : 1 }}
                      className="w-full bg-white text-slate-950 py-4 rounded-full text-lg font-semibold hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Continue
                    </motion.button>
                  </motion.div>
                )}

                {/* ── STEP 2: How would you view it? ── */}
                {step === 2 && (
                  <motion.div key="step2" {...stepTransition}>
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-4 transition-colors"
                    >
                      <ChevronLeft size={16} />
                      Back
                    </button>

                    <h2 className="text-2xl font-serif text-white mb-2">How would you view it?</h2>
                    <p className="text-slate-400 text-sm mb-6">
                      Pick your preferred device.
                    </p>

                    <div className="space-y-3 mb-6">
                      {QUIZ_DEVICES.map((device) => {
                        const isSelected = selectedDevices.has(device.id);
                        return (
                          <motion.button
                            key={device.id}
                            type="button"
                            onClick={() => toggleDevice(device.id)}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                              isSelected
                                ? 'bg-white/10 border-white/30 text-white'
                                : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-white/15' : 'bg-slate-800'
                            }`}>
                              {device.id === 'both' ? (
                                <div className="flex items-center -space-x-1">
                                  <Watch size={16} className={isSelected ? 'text-white' : 'text-slate-500'} />
                                  <Smartphone size={16} className={isSelected ? 'text-white' : 'text-slate-500'} />
                                </div>
                              ) : device.id === 'watch' ? (
                                <Watch size={20} className={isSelected ? 'text-white' : 'text-slate-500'} />
                              ) : (
                                <Smartphone size={20} className={isSelected ? 'text-white' : 'text-slate-500'} />
                              )}
                            </div>
                            <div>
                              <span className="text-base font-semibold block">{device.label}</span>
                              <span className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {device.desc}
                              </span>
                            </div>
                            {/* Selection indicator */}
                            <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-white bg-white' : 'border-slate-600'
                            }`}>
                              {isSelected && (
                                <motion.svg
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-3.5 h-3.5 text-slate-950"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => {
                        Analytics.checkoutStep2Completed(Array.from(selectedDevices));
                        setStep(3);
                      }}
                      disabled={selectedDevices.size === 0}
                      whileHover={{ scale: selectedDevices.size > 0 ? 1.02 : 1 }}
                      whileTap={{ scale: selectedDevices.size > 0 ? 0.98 : 1 }}
                      className="w-full bg-white text-slate-950 py-4 rounded-full text-lg font-semibold hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Continue
                    </motion.button>
                  </motion.div>
                )}

                {/* ── STEP 3: Email + Checkout ── */}
                {step === 3 && (
                  <motion.div key="step3" {...stepTransition}>
                    <button
                      onClick={() => { if (!isLoading) setStep(2); }}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                      Back
                    </button>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-5 uppercase tracking-wider">
                      <Sparkles size={12} />
                      {isSoldOut ? 'Sold Out' : "Founder's Edition"}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-serif text-white mb-2">
                      {isSoldOut ? 'All Spots Claimed.' : 'Claim Your Spot.'}
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">
                      {isSoldOut
                        ? 'Join the waitlist to be notified when more spots open.'
                        : 'Enter your email to continue to checkout.'}
                    </p>

                    {/* Spots remaining */}
                    {remaining !== null && !isSoldOut && (
                      <div className="flex items-center gap-2 mb-6 text-sm">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-slate-400">
                          Only <span className="text-white font-semibold">{remaining}</span> spots left
                        </span>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="checkout-email" className="block text-sm font-medium text-slate-300 mb-2">
                          Email
                        </label>
                        <input
                          id="checkout-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="founder@company.com"
                          className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-700 rounded-full text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                          disabled={isLoading}
                        />
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: [0, -5, 5, -5, 5, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{
                              opacity: { duration: 0.2 },
                              x: { duration: 0.4, ease: 'easeInOut' },
                            }}
                            className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl"
                          >
                            <p className="text-red-400 text-sm text-center">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="w-full bg-white text-slate-950 py-4 rounded-full text-lg font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full"
                          />
                        ) : isSoldOut ? (
                          'Join Waitlist'
                        ) : (
                          'Continue to Pay'
                        )}
                      </motion.button>

                      <p className="text-center text-slate-500 text-xs mt-3">
                        30-day money-back guarantee. Cancel anytime.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
