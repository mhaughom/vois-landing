import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const CHECKOUT_API = import.meta.env.VITE_API_URL || 'https://voisbackend-production.up.railway.app';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  remaining: number | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, remaining }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSoldOut = remaining === 0;

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

    setIsLoading(true);
    try {
      const response = await fetch(`${CHECKOUT_API}/api/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.status === 429) {
        setError('Too many attempts. Please wait a moment and try again.');
        return;
      }
      if (response.status === 410) {
        setError("All Founder spots have been claimed. Join the waitlist instead.");
        return;
      }
      if (response.status === 503) {
        setError('Checkout is temporarily unavailable. Please try again later.');
        return;
      }
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch {
      setError('Something went wrong. Please try again.');
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
            className="relative w-full max-w-md bg-slate-950 rounded-3xl p-8 shadow-2xl border border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-50 pointer-events-none" />

            <div className="relative z-10">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
