import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Check, Loader2, ChevronRight } from 'lucide-react';
import { waitlistService, type WaitlistEntry } from '../lib/supabase';
import { Analytics } from '../lib/analytics';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string; // Track where the modal was opened from
  prefillData?: {
    completedDemo?: boolean;
    watchedVideo?: boolean;
  };
}

type Step = 'email' | 'questions' | 'success';

const REFERRAL_SOURCES = [
  'Twitter/X',
  'Instagram',
  'TikTok',
  'Friend/colleague',
  'Search engine',
  'YouTube',
  'Reddit',
  'Other'
];

const USE_CASES = [
  'Personal tasks & reminders',
  'Work meetings & notes',
  'Ideas & brainstorming',
  'Shopping & lists',
  'Custom tracking (health, habits, etc.)'
];

const DEVICES = [
  'iPhone',
  'Apple Watch',
  'Mac',
  'All of the above'
];

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  source = 'unknown',
  prefillData = {}
}) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [useCases, setUseCases] = useState<string[]>([]);
  const [preferredDevice, setPreferredDevice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal closes
  const handleClose = () => {
    setStep('email');
    setEmail('');
    setReferralSource('');
    setUseCases([]);
    setPreferredDevice('');
    setError('');
    onClose();
  };

  // Validate email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle email submission (step 1)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Track email submission
    Analytics.waitlistEmailEntered(source);

    // Check if email already exists
    const exists = await waitlistService.checkIfEmailExists(email);
    if (exists) {
      setError('This email is already on the waitlist!');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setStep('questions');
  };

  // Handle optional questions submission (step 2)
  const handleQuestionsSubmit = async (skip = false) => {
    setIsSubmitting(true);
    setError('');

    const waitlistData: WaitlistEntry = {
      email,
      referral_source: skip ? undefined : referralSource || undefined,
      use_cases: skip ? undefined : (useCases.length > 0 ? useCases : undefined),
      preferred_device: skip ? undefined : preferredDevice || undefined,
      completed_demo: prefillData.completedDemo,
      watched_video: prefillData.watchedVideo,
      metadata: {
        signup_source: source,
        timestamp: new Date().toISOString(),
      }
    };

    const result = await waitlistService.addToWaitlist(waitlistData);

    if (result.success) {
      // Track successful signup
      Analytics.waitlistSignup(email, {
        source,
        referral_source: waitlistData.referral_source,
        use_cases: waitlistData.use_cases,
        preferred_device: waitlistData.preferred_device,
        completed_demo: prefillData.completedDemo,
        watched_video: prefillData.watchedVideo,
      });

      setStep('success');
    } else {
      setError(result.error || 'Failed to join waitlist');
    }

    setIsSubmitting(false);
  };

  // Toggle use case selection
  const toggleUseCase = (useCase: string) => {
    setUseCases(prev =>
      prev.includes(useCase)
        ? prev.filter(uc => uc !== useCase)
        : [...prev, useCase]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Email */}
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white mx-auto">
                    <Mail size={28} />
                  </div>

                  <h2 className="text-3xl font-serif text-slate-900 text-center mb-3">
                    Join the Waitlist
                  </h2>
                  <p className="text-slate-600 text-center mb-8">
                    Be the first to experience VOIS when we launch. We'll send you early access.
                  </p>

                  <form onSubmit={handleEmailSubmit}>
                    <div className="mb-6">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none text-lg transition-all"
                        autoFocus
                      />
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-600"
                        >
                          {error}
                        </motion.p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          Continue
                          <ChevronRight size={20} />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-slate-400 text-center mt-6">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </motion.div>
              )}

              {/* Step 2: Optional Questions */}
              {step === 'questions' && (
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-slate-900 mb-2">
                    Quick questions
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    Optional — helps us prioritize features you care about
                  </p>

                  {/* Question 1: Referral Source */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      How did you hear about VOIS?
                    </label>
                    <select
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-all bg-white"
                    >
                      <option value="">Select one...</option>
                      {REFERRAL_SOURCES.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>

                  {/* Question 2: Use Cases */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      What will you use VOIS for? (select all)
                    </label>
                    <div className="space-y-2">
                      {USE_CASES.map(useCase => (
                        <button
                          key={useCase}
                          type="button"
                          onClick={() => toggleUseCase(useCase)}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                            useCases.includes(useCase)
                              ? 'border-violet-500 bg-violet-50 text-violet-900'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            useCases.includes(useCase)
                              ? 'border-violet-500 bg-violet-500'
                              : 'border-slate-300'
                          }`}>
                            {useCases.includes(useCase) && <Check size={14} className="text-white" />}
                          </div>
                          <span className="text-sm">{useCase}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 3: Preferred Device */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Which device will you use most?
                    </label>
                    <select
                      value={preferredDevice}
                      onChange={(e) => setPreferredDevice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-all bg-white"
                    >
                      <option value="">Select one...</option>
                      {DEVICES.map(device => (
                        <option key={device} value={device}>{device}</option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 text-sm text-red-600 text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleQuestionsSubmit(true)}
                      disabled={isSubmitting}
                      className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 transition-all"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleQuestionsSubmit(false)}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white mx-auto"
                  >
                    <Check size={40} strokeWidth={3} />
                  </motion.div>

                  <h2 className="text-3xl font-serif text-slate-900 mb-3">
                    You're on the list!
                  </h2>
                  <p className="text-slate-600 mb-2">
                    We'll send you an email at
                  </p>
                  <p className="text-violet-600 font-semibold mb-8">
                    {email}
                  </p>

                  <div className="bg-violet-50 rounded-2xl p-6 mb-8 border border-violet-100">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      💜 <strong>What's next?</strong><br/>
                      We're launching soon! You'll be among the first to get early access and exclusive updates.
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
