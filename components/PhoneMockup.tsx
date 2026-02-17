import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../types';
import { 
  Mic, Sparkles, LayoutGrid, Search, Menu, 
  MessageSquare, CheckSquare, Calendar, Users, 
  Lightbulb, Book, ShoppingCart, ArrowUp, X,
  Play, Pause, Map, Camera
} from 'lucide-react';

interface PhoneMockupProps {
  activeSection: Section;
}

// --- Components mimicking the Screenshots ---

const Pill = ({ icon: Icon, label, colorClass, textClass }: any) => (
  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${colorClass} whitespace-nowrap`}>
    {Icon && <Icon size={14} className={textClass} />}
    <span className={`text-xs font-medium ${textClass}`}>{label}</span>
  </div>
);

const CategoryCard = ({ icon: Icon, title, desc, count, colorClass, iconBg, iconColor }: any) => (
  <div className={`p-4 rounded-3xl ${colorClass} mb-3 flex flex-col gap-3`}>
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h3 className={`font-semibold text-sm ${iconColor} mb-1`}>{title}</h3>
      <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{desc}</p>
    </div>
    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
      <Mic size={10} />
      <span>{count} recordings</span>
    </div>
  </div>
);

const StreamCard = ({ time, title, desc, duration, image, isPlaying }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-50 mb-4"
  >
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
        <span>{time}</span>
        <div className="w-px h-2 bg-slate-200" />
        <Camera size={10} />
      </div>
      <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full text-[10px] font-medium text-slate-600">
        <Play size={8} className="fill-current" />
        {duration}
      </div>
    </div>
    <div className="flex gap-3">
      <div className="flex-1">
        <h4 className="font-bold text-sm text-slate-900 mb-1 leading-tight">{title}</h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
      </div>
      {image && (
        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 rotate-2">
           {/* Placeholder for image */}
           <div className="w-full h-full bg-slate-200 relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100" />
           </div>
        </div>
      )}
    </div>
    {isPlaying && (
        <div className="mt-3 bg-black text-white p-3 rounded-full flex justify-between items-center">
             <div className="flex gap-1 items-end h-3 mx-2">
                {[1,2,3,4,2,5].map((h, i) => (
                    <motion.div 
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-0.5 bg-white rounded-full"
                    />
                ))}
             </div>
             <Pause size={14} fill="currentColor" />
        </div>
    )}
  </motion.div>
);

const SuggestionChip = ({ text }: { text: string }) => (
  <div className="px-4 py-2 rounded-full border border-slate-100 text-xs text-slate-500 bg-white shadow-sm whitespace-nowrap">
    {text}
  </div>
);

// --- Main Phone Component ---

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ activeSection }) => {
  const [time, setTime] = useState("03:33");
  const isChat = activeSection === 'hero' || activeSection === 'problem';
  const isCategories = activeSection === 'adapt' || activeSection === 'privacy';
  const isStream = activeSection === 'solution' || activeSection === 'demo' || activeSection === 'cta';

  return (
    <div className="relative w-[320px] h-[650px] bg-white rounded-[3.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] border-[8px] border-slate-900 overflow-hidden z-20 mx-auto">
      
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 px-6 flex justify-between items-center z-50 text-slate-900">
        <span className="text-[12px] font-semibold">{time}</span>
        <div className="flex gap-1.5">
           <div className="w-4 h-3 bg-slate-900 rounded-[2px] opacity-20"/>
           <div className="w-4 h-3 bg-slate-900 rounded-[2px] opacity-20"/>
           <div className="w-5 h-3 border border-slate-300 rounded-[3px] relative">
             <div className="absolute inset-0.5 bg-slate-900 rounded-[1px] w-[60%]" />
           </div>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="w-full h-full pt-12 pb-20 bg-[#F9FAFB] relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: CHAT (Hero) */}
          {isChat && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col h-full relative"
            >
                {/* Header */}
                <div className="px-6 py-2 flex justify-between items-center">
                    <Menu size={20} className="text-slate-600" />
                    <span className="font-semibold text-sm">Life Intelligence</span>
                    <div className="flex gap-2 bg-slate-100 rounded-full px-3 py-1.5">
                        <MessageSquare size={14} />
                        <span className="text-xs font-medium">Chat with</span>
                    </div>
                </div>

                {/* Center Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-12">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm"
                    >
                        <Sparkles size={32} className="text-slate-400" fill="currentColor" fillOpacity={0.2} />
                    </motion.div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Ask Vois anything</h2>
                    <p className="text-center text-xs text-slate-400 max-w-[200px] leading-relaxed mb-8">
                        This is ChatGPT, just with the context of your life.
                    </p>

                    {/* Suggestions Scroll */}
                    <div className="w-full overflow-hidden relative">
                         <div className="flex flex-wrap gap-2 justify-center opacity-60">
                             <SuggestionChip text="When am I usually unavailable?" />
                             <SuggestionChip text="Summarize my week" />
                             <SuggestionChip text="What did I forget?" />
                         </div>
                    </div>
                </div>

                {/* Bottom Input Area */}
                <div className="px-4 w-full absolute bottom-4">
                     <div className="bg-white rounded-[2rem] p-2 pr-2 pl-4 shadow-lg border border-slate-100 flex items-center gap-3">
                        <div className="text-slate-300"><Sparkles size={16} /></div>
                        <span className="text-sm text-slate-300 flex-1">Message Vois...</span>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                             <Mic size={16} />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                             <ArrowUp size={16} />
                        </div>
                     </div>
                </div>
            </motion.div>
          )}

          {/* VIEW 2: CATEGORIES (Adapt/Privacy) */}
          {isCategories && (
            <motion.div 
                key="categories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col h-full overflow-y-auto no-scrollbar"
            >
                {/* Header */}
                <div className="px-6 pt-2 pb-4 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                         <X size={20} className="text-slate-400" />
                         <div className="flex gap-2 text-sm font-semibold">
                             <MessageSquare size={18} />
                             Chat with...
                         </div>
                         <div className="w-5" /> 
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <div className="bg-life-blue-light text-life-blue-dark px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex gap-2 items-center">
                            <LayoutGrid size={14} /> Categories
                        </div>
                        <div className="bg-white border border-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex gap-2 items-center">
                            <Users size={14} /> People
                        </div>
                        <div className="bg-white border border-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex gap-2 items-center">
                            <Mic size={14} /> Recordings
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {/* Quick Access Pills */}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Quick Access</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                        <Pill label="Messages" colorClass="bg-life-blue-light" textClass="text-life-blue-dark" icon={MessageSquare} />
                        <Pill label="Tasks" colorClass="bg-life-green-light" textClass="text-life-green-dark" icon={CheckSquare} />
                        <Pill label="Events" colorClass="bg-life-orange-light" textClass="text-life-orange-dark" icon={Calendar} />
                        <Pill label="Research" colorClass="bg-life-purple-light" textClass="text-life-purple-dark" icon={Search} />
                        <Pill label="People" colorClass="bg-life-cyan-light" textClass="text-life-cyan-dark" icon={Users} />
                        <Pill label="Insights" colorClass="bg-life-yellow-light" textClass="text-life-yellow-dark" icon={Lightbulb} />
                    </div>

                    {/* Categories */}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Your Categories</p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <CategoryCard 
                            title="Journal"
                            desc="Capture your daily thoughts, reflections, and personal notes."
                            count={0}
                            colorClass="bg-life-blue-light/50"
                            iconBg="bg-white"
                            iconColor="text-life-blue-dark"
                            icon={Book}
                        />
                        <CategoryCard 
                            title="Shopping List"
                            desc="Organize shopping items by store - Supermarket, Tech, etc."
                            count={2}
                            colorClass="bg-life-pink-light/50"
                            iconBg="bg-white"
                            iconColor="text-life-pink-dark"
                            icon={ShoppingCart}
                        />
                    </motion.div>
                </div>
            </motion.div>
          )}

          {/* VIEW 3: STREAM (Demo/Solution) */}
          {isStream && (
             <motion.div 
                key="stream"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col h-full bg-[#F2F4F6]"
            >
                {/* Header */}
                <div className="px-6 py-4 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                        <Map size={14} className="text-slate-500"/>
                        <span className="text-xs font-medium text-slate-700">Map</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight">Stream</span>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                        <Search size={14} className="text-slate-500"/>
                        <span className="text-xs font-medium text-slate-700">Search</span>
                    </div>
                </div>
                
                {/* Horizontal Icons Scroll */}
                <div className="bg-white pb-4 px-4 overflow-hidden border-b border-slate-100">
                    <div className="flex justify-between px-2 pt-2">
                         {[Calendar, Users, Lightbulb, Search, CheckSquare].map((Icon, i) => (
                             <div key={i} className="flex flex-col items-center gap-1 opacity-50 scale-90">
                                 <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center">
                                     <Icon size={20} className="text-slate-400" />
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>

                {/* Feed */}
                <div className="p-4 overflow-y-auto no-scrollbar pb-24">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Today</p>
                     
                     <StreamCard 
                        time="2:46 AM"
                        title="Adding Photo to People Directory"
                        desc="Here is a photo of my wife Alette, could you add that to the people directory? I will add it..."
                        duration="1:13"
                        image={true}
                     />
                     <StreamCard 
                        time="2:43 AM"
                        title="Testing Photo Capture"
                        desc="Okay I'm just taking a picture here to see if this works. Can you add this?"
                        duration="0:09"
                        image={true}
                     />
                     <StreamCard 
                        time="2:42 AM"
                        title="Adding Alette to People"
                        desc="So here is an image of my wife..."
                        duration="0:07"
                        image={true}
                        isPlaying={true}
                     />
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation Bar (Overlay) */}
      <div className="absolute bottom-6 left-6 right-6 h-16 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 z-50 border border-white/50">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full ${isChat ? 'text-black' : 'text-slate-400'}`}
          >
              <Mic size={24} />
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full ${isStream ? 'text-black' : 'text-slate-400'}`}
          >
              <Sparkles size={24} />
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full ${isCategories ? 'text-black' : 'text-slate-400'}`}
          >
              <LayoutGrid size={24} />
          </motion.div>
      </div>

      {/* Floating Record Button - visible only on stream */}
      {isStream && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bottom-24 right-8 z-50 flex flex-col items-center gap-1 group"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-slate-900 shadow-[0_8px_30px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center transition-colors duration-200 hover:bg-red-500"
          >
            <Mic size={28} className="text-white" />
          </motion.button>
          <span className="text-[10px] font-medium text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Record
          </span>
        </motion.div>
      )}

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full z-50 opacity-20"></div>
    </div>
  );
};