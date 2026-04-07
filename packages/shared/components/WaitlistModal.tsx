import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Check, Loader2, ChevronRight, Calendar, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { waitlistService, type WaitlistEntry } from '@li/shared/lib/supabase';
import { Analytics } from '@li/shared/lib/analytics';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string; // Track where the modal was opened from
  prefillData?: {
    completedDemo?: boolean;
    watchedVideo?: boolean;
  };
}

type Step = 'useCases' | 'userType' | 'devices' | 'industry' | 'referral' | 'email' | 'success';

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  source = 'unknown',
  prefillData = {}
}) => {
  const { t } = useTranslation('waitlist-modal');

  // Arrays moved inside component so they are translated at render time
  const USER_TYPES = t('userTypes', { returnObjects: true }) as string[];
  const REFERRAL_SOURCES = t('referralSources', { returnObjects: true }) as string[];
  const USE_CASES = t('useCases', { returnObjects: true }) as string[];
  const DEVICES = t('devices', { returnObjects: true }) as string[];
  const INDUSTRIES = t('industries', { returnObjects: true, defaultValue: [] }) as string[];
  const hasIndustryStep = Array.isArray(INDUSTRIES) && INDUSTRIES.length > 0;
  const phonePlaceholder = t('stepEmail.phonePlaceholder', { defaultValue: '' });
  const hasPhoneField = !!phonePlaceholder;
  const bookDemoLabel = t('stepSuccess.bookDemo', { defaultValue: '' });
  const hasBookDemo = !!bookDemoLabel;

  const [step, setStep] = useState<Step>('useCases');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('');
  const [industry, setIndustry] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [useCases, setUseCases] = useState<string[]>([]);
  const [devices, setDevices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Tracking state
  const stepStartTime = useRef<number>(Date.now());
  const modalOpenTime = useRef<number>(Date.now());
  const completedSteps = useRef<string[]>([]);

  // Track when modal opens
  useEffect(() => {
    if (isOpen) {
      modalOpenTime.current = Date.now();
      stepStartTime.current = Date.now();
      completedSteps.current = [];
    }
  }, [isOpen]);

  // Track when step changes
  useEffect(() => {
    if (!isOpen) return;

    const stepNumber = ['useCases', 'userType', 'devices', 'referral', 'email'].indexOf(step) + 1;

    if (step !== 'success') {
      Analytics.waitlistStepViewed(step, stepNumber);
      stepStartTime.current = Date.now();
    }
  }, [step, isOpen]);

  // Helper to get time spent on current step
  const getStepTimeSpent = () => {
    return Math.round((Date.now() - stepStartTime.current) / 1000);
  };

  // Helper to get total time in funnel
  const getTotalTimeSpent = () => {
    return Math.round((Date.now() - modalOpenTime.current) / 1000);
  };

  // Reset state when modal closes
  const handleClose = () => {
    // Track abandonment if not on success step
    if (step !== 'success') {
      const stepNumber = ['useCases', 'userType', 'devices', 'referral', 'email'].indexOf(step) + 1;
      const timeSpent = getStepTimeSpent();
      const totalTime = getTotalTimeSpent();

      Analytics.waitlistStepAbandoned(step, stepNumber, timeSpent);
      Analytics.waitlistFunnelDropoff(step, stepNumber, totalTime, completedSteps.current);
    }

    setStep('useCases');
    setEmail('');
    setPhone('');
    setUserType('');
    setIndustry('');
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

  // Helper to navigate to next step with tracking
  const navigateToStep = (fromStep: Step, toStep: Step, answers?: Record<string, any>) => {
    const stepNumber = ['useCases', 'userType', 'devices', 'referral', 'email'].indexOf(fromStep) + 1;
    const timeSpent = getStepTimeSpent();

    // Track step completion
    Analytics.waitlistStepCompleted(fromStep, stepNumber, timeSpent, answers);

    // Mark as completed
    completedSteps.current.push(fromStep);

    // Move to next step
    setStep(toStep);
  };

  // Toggle device selection
  const toggleDevice = (device: string) => {
    const willBeSelected = !devices.includes(device);

    setDevices(prev =>
      prev.includes(device)
        ? prev.filter(d => d !== device)
        : [...prev, device]
    );

    // Track the toggle
    Analytics.waitlistAnswerToggled('devices', device, willBeSelected);
  };

  // Toggle use case selection
  const toggleUseCase = (useCase: string) => {
    const willBeSelected = !useCases.includes(useCase);

    setUseCases(prev =>
      prev.includes(useCase)
        ? prev.filter(uc => uc !== useCase)
        : [...prev, useCase]
    );

    // Track the toggle
    Analytics.waitlistAnswerToggled('use_cases', useCase, willBeSelected);
  };

  // Handle email submission (final step before success)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError(t('errors.emailInvalid'));
      return;
    }

    setIsSubmitting(true);

    // Track email submission
    Analytics.waitlistEmailEntered(source);

    // Check if email already exists
    const exists = await waitlistService.checkIfEmailExists(email);
    if (exists) {
      setError(t('errors.emailExists'));
      setIsSubmitting(false);
      return;
    }

    // IMPORTANT: Identify user in PostHog BEFORE saving to Supabase
    // This ensures we can correlate even if user has ad blockers
    Analytics.waitlistSignup(email, {
      source,
      referral_source: referralSource,
      use_cases: useCases,
      preferred_device: devices.join(', '),
      completed_demo: prefillData.completedDemo,
      watched_video: prefillData.watchedVideo,
      user_type: userType,
      industry: industry || undefined,
      phone: phone || undefined,
    });

    // Get PostHog distinct_id (will be null if PostHog is blocked)
    const posthogDistinctId = Analytics.getDistinctId();

    // Submit to waitlist with PostHog ID for correlation
    const waitlistData: WaitlistEntry = {
      email,
      referral_source: referralSource || undefined,
      use_cases: useCases.length > 0 ? useCases : undefined,
      preferred_device: devices.length > 0 ? devices.join(', ') : undefined,
      posthog_distinct_id: posthogDistinctId || undefined,
      completed_demo: prefillData.completedDemo,
      watched_video: prefillData.watchedVideo,
      metadata: {
        signup_source: source,
        timestamp: new Date().toISOString(),
        user_type: userType,
        devices: devices,
        industry: industry || undefined,
        phone: phone || undefined,
      }
    };

    const result = await waitlistService.addToWaitlist(waitlistData);

    if (result.success) {
      setStep('success');
    } else {
      setError(result.error || t('errors.joinFailed'));
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
                    {t('stepUseCases.heading')}
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    {t('stepUseCases.subLabel')}
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
                    onClick={() => {
                      Analytics.waitlistQuestionAnswered('use_cases', useCases, true);
                      navigateToStep('useCases', 'userType', { use_cases: useCases });
                    }}
                    disabled={useCases.length === 0}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    {t('continue')}
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    {t('stepUseCases.stepIndicator')}
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
                    {t('stepUserType.heading')}
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    {t('stepUserType.subLabel')}
                  </p>

                  <div className="space-y-3 mb-8">
                    {USER_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setUserType(type);
                          Analytics.waitlistQuestionAnswered('user_type', type, false);
                        }}
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
                    onClick={() => navigateToStep('userType', hasIndustryStep ? 'industry' : 'devices', { user_type: userType })}
                    disabled={!userType}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {t('continue')}
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    {t('stepUserType.stepIndicator')}
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
                    {t('stepDevices.heading')}
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    {t('stepDevices.subLabel')}
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
                    onClick={() => {
                      Analytics.waitlistQuestionAnswered('devices', devices, true);
                      navigateToStep('devices', 'referral', { devices });
                    }}
                    disabled={devices.length === 0}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    {t('continue')}
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    {t('stepDevices.stepIndicator')}
                  </p>
                </motion.div>
              )}

              {/* Step 3b: Industry (replaces devices when available) */}
              {step === 'industry' && (
                <motion.div
                  key="industry"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-slate-900 mb-2">
                    {t('stepIndustry.heading')}
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    {t('stepIndustry.subLabel')}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8 max-h-[320px] overflow-y-auto">
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => {
                          setIndustry(ind);
                          Analytics.waitlistQuestionAnswered('industry', ind, false);
                        }}
                        className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                          industry === ind
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigateToStep('industry', 'referral', { industry })}
                    disabled={!industry}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    {t('continue')}
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    {t('stepIndustry.stepIndicator')}
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
                    {t('stepReferral.heading')}
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    {t('stepReferral.subLabel')}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {REFERRAL_SOURCES.map(src => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => {
                          setReferralSource(src);
                          Analytics.waitlistQuestionAnswered('referral_source', src, false);
                        }}
                        className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                          referralSource === src
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigateToStep('referral', 'email', { referral_source: referralSource })}
                    disabled={!referralSource}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    {t('continue')}
                    <ChevronRight size={20} />
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    {t('stepReferral.stepIndicator')}
                  </p>
                </motion.div>
              )}

              {/* Step 5: Email */}
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
                    {t('stepEmail.heading')}
                  </h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    {t('stepEmail.subLabel')}
                  </p>

                  <form onSubmit={handleEmailSubmit}>
                    <div className="mb-6 space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('stepEmail.placeholder')}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-lg transition-all"
                        autoFocus
                      />
                      {hasPhoneField && (
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={phonePlaceholder}
                            className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-lg transition-all"
                          />
                        </div>
                      )}
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
                          {t('stepEmail.joining')}
                        </>
                      ) : (
                        t('stepEmail.joinWaitlist')
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    {t('stepEmail.stepIndicator')}
                  </p>
                </motion.div>
              )}

              {/* Step 6: Success */}
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
                    {t('stepSuccess.heading')}
                  </h2>
                  <p className="text-slate-600 mb-2">
                    {t('stepSuccess.willSendEmail')}
                  </p>
                  <p className="text-slate-900 font-semibold mb-8">
                    {email}
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      ✓ <strong>{t('stepSuccess.whatsNext')}</strong><br/>
                      {t('stepSuccess.whatsNextBody')}
                    </p>
                  </div>

                  {hasBookDemo && (
                    <a
                      href="https://calendly.com/hello-tryvois/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 mb-3"
                    >
                      <Calendar size={20} />
                      {bookDemoLabel}
                    </a>
                  )}
                  {hasBookDemo && (
                    <p className="text-xs text-slate-500 text-center mb-4">
                      {t('stepSuccess.bookDemoSub')}
                    </p>
                  )}

                  <button
                    onClick={handleClose}
                    className={`w-full py-4 rounded-2xl font-semibold transition-all ${
                      hasBookDemo
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {t('stepSuccess.done')}
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
