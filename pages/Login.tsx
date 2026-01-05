import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const STRIPE_LINK = "#";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Placeholder for Supabase/Firebase auth
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Placeholder validation - replace with actual auth
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }
      
      // For demo purposes, show error for any login attempt
      // Replace this with actual auth logic
      throw new Error('Invalid credentials. Please try again.');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 min-h-screen flex items-center justify-center px-6 py-12" 
      style={{ zIndex: 9999, pointerEvents: 'all', isolation: 'isolate' }}
    >
      {/* Solid background to cover any WebGL canvas */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8 md:p-10">
          
          {/* Logo */}
          <Link to="/" className="flex justify-center mb-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 bg-black rounded-xl flex items-center justify-center cursor-pointer"
            >
              <span className="text-white font-serif italic font-medium text-xl pt-1">V</span>
            </motion.div>
          </Link>
          
          {/* Headline */}
          <h1 className="text-2xl md:text-3xl font-serif text-slate-900 text-center mb-2">
            Welcome back, Founder.
          </h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            Enter your credentials to access your dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@company.com"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: [0, -5, 5, -5, 5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    x: { duration: 0.4, ease: "easeInOut" }
                  }}
                  className="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl"
                >
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full bg-black text-white py-4 rounded-full text-base font-medium hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Enter Vois
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Forgot Password */}
            <div className="text-center">
              <button type="button" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                Forgot password?
              </button>
            </div>
          </form>
        </div>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          Not a Founder yet?{' '}
          <Link 
            to="/?scroll=pricing" 
            className="text-slate-900 font-medium hover:underline underline-offset-4 transition-all"
          >
            Get Early Access
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;

