import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, ArrowLeft } from 'lucide-react';
import { Analytics } from '../lib/analytics';

const workVideos = [
  {
    id: 1,
    title: 'Meeting Notes',
    description: 'Record meeting → get action items',
    color: '#6366f1', // indigo
  },
  {
    id: 2,
    title: 'Email by Voice',
    description: '"Read my inbox" while driving',
    color: '#0ea5e9', // sky
  },
  {
    id: 3,
    title: 'Projects AI',
    description: 'AI identifies risks and blockers',
    color: '#f59e0b', // amber
  },
  {
    id: 4,
    title: 'Voice Reports',
    description: 'Talk through a site inspection → PDF done',
    color: '#10b981', // emerald
  },
  {
    id: 5,
    title: 'Live Guide',
    description: 'AI sees your screen, helps you in Photoshop',
    color: '#ec4899', // pink
  },
  {
    id: 6,
    title: 'Team Sync',
    description: 'Share projects, assign tasks by voice',
    color: '#8b5cf6', // violet
  },
];

const Work: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Analytics.workPageViewed();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      Analytics.workBetaSubmitted();
      setSubmitted(true);
      // Here you would typically send the email to your backend
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* Back to Home — full page nav to avoid Three.js re-init blocking */}
        <a href="/">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-600">Back</span>
          </motion.div>
        </a>
        
        {/* Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              <img
                src="/Logo/vois-logo.svg"
                alt="Vois"
                className="h-8 w-8"
              />
              <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
              <span className="text-slate-400 text-sm font-medium">for Work</span>
            </motion.div>
          </a>
        </div>

        <div className="w-20" /> {/* Spacer for centering */}
      </motion.nav>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-4">
            Vois for Work
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Voice-first productivity for teams. See how Vois transforms the way you work.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {workVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Video Placeholder */}
              <div
                className="aspect-video rounded-2xl overflow-hidden relative cursor-pointer"
                style={{ backgroundColor: video.color + '15' }}
                onClick={() => Analytics.workVideoClicked(video.title)}
              >
                {/* Placeholder gradient */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ 
                    background: `linear-gradient(135deg, ${video.color}40 0%, ${video.color}10 100%)` 
                  }}
                />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:shadow-xl"
                    style={{ backgroundColor: video.color }}
                  >
                    <Play size={24} className="text-white fill-current ml-1" />
                  </motion.div>
                </div>

                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-600">
                  Coming Soon
                </div>
              </div>

              {/* Video Info */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {video.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {video.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="bg-slate-950 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
              Join the Beta
            </h2>
            <p className="text-slate-400 mb-8">
              Be among the first teams to experience voice-first productivity.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  Get Access
                  <ArrowRight size={18} />
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 px-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl"
              >
                <p className="text-emerald-400 font-medium">
                  You're on the list! We'll be in touch soon.
                </p>
              </motion.div>
            )}

            <p className="text-slate-500 text-sm mt-6">
              No spam. Just updates on Vois for Work.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Vois AI
          </p>
          <a href="/" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
            Back to Home
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Work;
