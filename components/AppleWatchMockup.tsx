import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

export const AppleWatchMockup = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-[180px] h-[220px] bg-slate-200 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border-[6px] border-[#BFBFBF] z-10"
    >
      {/* Watch Body (Titanium/Aluminum look) */}
      <div className="absolute inset-0 rounded-[2.2rem] bg-[#1a1a1a] overflow-hidden ring-1 ring-inset ring-slate-400/20">
        
        {/* Screen */}
        <div className="w-full h-full bg-black flex flex-col items-center justify-center relative">
           
           {/* Ambient Blur */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-life-blue-dark/30 blur-2xl rounded-full animate-pulse-slow" />

           {/* Content */}
           <motion.div 
             animate={{ scale: [1, 1.1, 1] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             className="relative z-10 flex flex-col items-center gap-2"
           >
              <div className="w-12 h-12 rounded-full bg-life-blue-dark flex items-center justify-center text-white shadow-lg shadow-life-blue-dark/40">
                <Mic size={24} />
              </div>
              <div className="flex flex-col items-center">
                 <span className="text-white font-serif italic text-lg">Vois</span>
                 <span className="text-slate-400 text-[10px] uppercase tracking-widest">Listening...</span>
              </div>
           </motion.div>

           {/* Time Top Right */}
           <div className="absolute top-4 right-5 text-slate-400 text-xs font-medium">10:09</div>
        </div>
      </div>

      {/* Digital Crown */}
      <div className="absolute top-[45px] -right-[10px] w-3 h-10 bg-[#BFBFBF] rounded-r-md shadow-sm border-l border-slate-400" />
      
      {/* Side Button */}
      <div className="absolute top-[100px] -right-[10px] w-3 h-14 bg-[#BFBFBF] rounded-r-md shadow-sm border-l border-slate-400" />

      {/* Strap Attachments (Visual only) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-8 bg-slate-800 rounded-t-xl -z-10" />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-8 bg-slate-800 rounded-b-xl -z-10" />
    </motion.div>
  );
};