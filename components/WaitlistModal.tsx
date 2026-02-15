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

type Step = 'useCases' | 'userType' | 'devices' | 'referral' | 'email' | 'success';

const USER_TYPES = [
  'Personal',
  'Work',
  'Both'
];

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
  'Mac'
];

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  source = 'unknown',
  prefillData = {}
}) => {
  const [step, setStep] = useState<Step>('useCases');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [useCases, setUseCases] = useState<string[]>([]);
  const [devices, setDevices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal closes
  const handleClose = () => {
    setStep('useCases');
    setEmail('');
    setUserType('');
    setReferralSource('');
    setUseCases([]);
    setDevices([]);
    setError('');
    onClose();
  };

  // Validate email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Toggle device selection
  const toggleDevice = (device: string) => {
    setDevices(prev =>
      prev.includes(device)
        ? prev.filter(d => d !== device)
        : [...prev, device]
    );
  };

  // Toggle use case selection
  const toggleUseCase = (useCase: string) => {
    setUseCases(prev =>
      prev.includes(useCase)
        ? prev.filter(uc => uc !== useCase)
        : [...prev, useCase]
    );
  };

  // Handle email submission (final step before success)
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

    // Submit to waitlist
    const waitlistData: WaitlistEntry = {
      email,
      referral_source: referralSource || undefined,
      use_cases: useCases.length > 0 ? useCases : undefined,
      preferred_device: devices.length > 0 ? devices.join(', ') : undefined,
      completed_demo: prefillData.completedDemo,
      watched_video: prefillData.watchedVideo,
      metadata: {
        signup_source: source,
        timestamp: new Date().toISOString(),
        user_type: userType,
        devices: devices,
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
              {/* Step 1: Use Cases */}
              {step === 'useCases' && (
                <motion.div
                  key="useCases"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-slate-900 mb-2">
                    What will you use VOIS for?
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    Select all that apply
                  </p>

                  <div className="space-y-3 mb-8">
                    {USE_CASES.map(useCase => (
                      <button
                        key={useCase}
                        type="button"
                        onClick={() => toggleUseCase(useCase)}
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                          useCases.includes(useCase)
                            ? 'border-slate-900 bg-slate-50 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          useCases.includes(useCase)
                            ? 'border-slate-900 bg-slate-900'
                            : 'border-slate-300'
                        }`}>
                          {useCases.includes(useCase) && <Check size={16} className="text-white" />}
                        </div>
                        <span className="text-sm">{useCase}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('userType')}
                    disabled={useCases.length === 0}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    Step 1 of 5
                  </p>
                </motion.div>
              )}

              {/* Step 2: User Type */}
              {step === 'userType' && (
                <motion.div
                  key="userType"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-slate-900 mb-2">
                    How will you use VOIS?
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    Choose one
                  </p>

                  <div className="space-y-3 mb-8">
                    {USER_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUserType(type)}
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all text-left ${
                          userType === type
                            ? 'border-slate-900 bg-slate-50 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="font-medium">{type}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('devices')}
                    disabled={!userType}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    Step 2 of 5
                  </p>
                </motion.div>
              )}

              {/* Step 3: Devices */}
              {step === 'devices' && (
                <motion.div
                  key="devices"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-slate-900 mb-2">
                    Which devices will you use?
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    Select all that apply
                  </p>

                  <div className="space-y-3 mb-8">
                    {DEVICES.map(device => (
                      <button
                        key={device}
                        type="button"
                        onClick={() => toggleDevice(device)}
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                          devices.includes(device)
                            ? 'border-slate-900 bg-slate-50 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          devices.includes(device)
                            ? 'border-slate-900 bg-slate-900'
                            : 'border-slate-300'
                        }`}>
                          {devices.includes(device) && <Check size={16} className="text-white" />}
                        </div>
                        <span className="font-medium">{device}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('referral')}
                    disabled={devices.length === 0}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    Step 3 of 5
                  </p>
                </motion.div>
              )}

              {/* Step 4: Referral Source */}
              {step === 'referral' && (
                <motion.div
                  key="referral"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-slate-900 mb-2">
                    How did you hear about VOIS?
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    This helps us understand our community
                  </p>

                  <div className="mb-8">
                    <select
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none transition-all bg-white text-base"
                    >
                      <option value="">Select one...</option>
                      {REFERRAL_SOURCES.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setStep('email')}
                    disabled={!referralSource}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    Step 4 of 5
                  </p>
                </motion.div>
              )}

              {/* Step 4: Email */}
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-slate-900 text-white mx-auto">
                    <Mail size={28} />
                  </div>

                  <h2 className="text-2xl font-serif text-slate-900 mb-2">
                    What's your email?
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    We'll send you early access when we launch
                  </p>

                  <form onSubmit={handleEmailSubmit}>
                    <div className="mb-6">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-lg transition-all"
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
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    Step 4 of 5
                  </p>
                </motion.div>
              )}

              {/* Step 5: Success */}
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
                  <p className="text-slate-900 font-semibold mb-8">
                    {email}
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      ✓ <strong>What's next?</strong><br/>
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
