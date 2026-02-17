import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, FileText, ChevronDown, X, Users, Check, Plus, Hourglass } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const ActionCards: React.FC = () => {
  // Category options
  const categoryOptions = ['Personal', 'Work', 'Health', 'Finance', 'Home', 'Social'];
  const personCategoryOptions = ['Personal', 'Professional', 'Family', 'Friends'];

  // Task Card State
  const [taskDate, setTaskDate] = useState<Date>(new Date(2026, 1, 6)); // Feb 6
  const [taskCategory, setTaskCategory] = useState<string>('Work');
  const [taskTitle, setTaskTitle] = useState('Follow up with Sarah about Q1 budget');
  const [taskEmoji, setTaskEmoji] = useState('💼');
  const [taskDuration, setTaskDuration] = useState('15 min');
  const [taskDescription, setTaskDescription] = useState('Sarah mentioned needing the revised budget projections. Send the updated spreadsheet and schedule a quick call.');

  // People Card State
  const [personCategory, setPersonCategory] = useState<string>('Professional');
  const [personName, setPersonName] = useState('Deborah J. Trouw');
  const [personInitials, setPersonInitials] = useState('DJ');
  const [personDescription, setPersonDescription] = useState('Financial advisor business card');
  const [personSubtext, setPersonSubtext] = useState('Name on business card');

  // Calendar Card State
  const [eventDate, setEventDate] = useState<Date>(new Date(2026, 1, 9)); // Feb 9 (Monday, not Sunday)
  const [eventCategory, setEventCategory] = useState<string>('Work');
  const [eventTitle, setEventTitle] = useState('Team Strategy Meeting');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [eventDuration, setEventDuration] = useState('1 hr');
  const [eventLocation, setEventLocation] = useState('');
  const [eventNote, setEventNote] = useState('Quarterly planning and team alignment.');

  // Date picker visibility states
  const [showTaskDatePicker, setShowTaskDatePicker] = useState(false);
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);

  // Category dropdown visibility states
  const [showTaskCategoryDropdown, setShowTaskCategoryDropdown] = useState(false);
  const [showPersonCategoryDropdown, setShowPersonCategoryDropdown] = useState(false);
  const [showEventCategoryDropdown, setShowEventCategoryDropdown] = useState(false);

  // Schedule dropdown visibility
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);

  // Card action states - 'added', 'dismissed', or false
  const [taskAction, setTaskAction] = useState<'added' | 'dismissed' | false>(false);
  const [personAction, setPersonAction] = useState<'added' | 'dismissed' | false>(false);
  const [eventAction, setEventAction] = useState<'added' | 'dismissed' | false>(false);

  // Refs for contentEditable
  const taskTitleRef = useRef<HTMLHeadingElement>(null);
  const personNameRef = useRef<HTMLHeadingElement>(null);
  const eventTitleRef = useRef<HTMLHeadingElement>(null);

  // Duration options
  const durationOptions = ['15 min', '30 min', '45 min', '1 hr', '1.5 hrs', '2 hrs', '3 hrs', '4 hrs'];
  const [showTaskDurationDropdown, setShowTaskDurationDropdown] = useState(false);
  const [showEventDurationDropdown, setShowEventDurationDropdown] = useState(false);

  // Time options
  const timeOptions = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ];
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Personal: 'from-green-500 to-emerald-500',
      Work: 'from-blue-500 to-blue-600',
      Health: 'from-red-500 to-rose-500',
      Finance: 'from-purple-500 to-purple-600',
      Home: 'from-orange-500 to-amber-500',
      Social: 'from-pink-500 to-pink-600',
      Professional: 'from-cyan-400 to-cyan-500',
      Family: 'from-indigo-500 to-indigo-600',
      Friends: 'from-teal-500 to-teal-600',
    };
    return colors[category] || 'from-slate-500 to-slate-600';
  };

  const handleContentEditableBlur = (
    e: React.FocusEvent<HTMLElement>,
    setter: (value: string) => void
  ) => {
    const text = e.currentTarget.textContent || '';
    setter(text);
  };

  // Generate 3-day calendar view with time slots centered on event date
  const getThreeDayCalendar = () => {
    // Center calendar on the event date
    const centerDate = new Date(eventDate);

    const days = [-1, 0, 1].map(dayOffset => {
      const date = new Date(centerDate);
      date.setDate(date.getDate() + dayOffset);
      return {
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        isEventDay: dayOffset === 0,
      };
    });

    const timeSlots = ['9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p'];

    // Events for each day (with hour and duration)
    const events = [
      { day: 0, hour: 14, duration: 1, title: 'Client call', color: 'blue', isPending: false },
      { day: 1, hour: 9, duration: 1, title: 'Planning session', color: 'blue', isPending: false },
      { day: 1, hour: 16, duration: 1.5, title: 'Gym', color: 'red', isPending: false },
      { day: 2, hour: 11, duration: 1, title: 'Lunch meeting', color: 'pink', isPending: false },
    ];

    // Add the pending event being scheduled
    const eventHour = parseInt(eventTime.split(':')[0]);
    const isPM = eventTime.includes('PM');
    const eventHour24 = isPM ? (eventHour === 12 ? 12 : eventHour + 12) : (eventHour === 12 ? 0 : eventHour);

    events.push({
      day: 1, // Center day (the event day)
      hour: eventHour24,
      duration: parseInt(eventDuration.replace(/[^\d]/g, '')) / 60 || 1,
      title: eventTitle,
      color: 'green',
      isPending: true,
    });

    return { days, timeSlots, events };
  };

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setShowTaskDatePicker(false);
    setShowEventDatePicker(false);
    setShowTaskDurationDropdown(false);
    setShowEventDurationDropdown(false);
    setShowTimeDropdown(false);
    setShowTaskCategoryDropdown(false);
    setShowPersonCategoryDropdown(false);
    setShowEventCategoryDropdown(false);
    setShowScheduleDropdown(false);
  };

  // Toggle functions that close all others first
  const toggleTaskDatePicker = () => {
    const newState = !showTaskDatePicker;
    closeAllDropdowns();
    setShowTaskDatePicker(newState);
  };

  const toggleEventDatePicker = () => {
    const newState = !showEventDatePicker;
    closeAllDropdowns();
    setShowEventDatePicker(newState);
  };

  const toggleTaskDuration = () => {
    const newState = !showTaskDurationDropdown;
    closeAllDropdowns();
    setShowTaskDurationDropdown(newState);
  };

  const toggleEventDuration = () => {
    const newState = !showEventDurationDropdown;
    closeAllDropdowns();
    setShowEventDurationDropdown(newState);
  };

  const toggleTime = () => {
    const newState = !showTimeDropdown;
    closeAllDropdowns();
    setShowTimeDropdown(newState);
  };

  const toggleTaskCategory = () => {
    const newState = !showTaskCategoryDropdown;
    closeAllDropdowns();
    setShowTaskCategoryDropdown(newState);
  };

  const togglePersonCategory = () => {
    const newState = !showPersonCategoryDropdown;
    closeAllDropdowns();
    setShowPersonCategoryDropdown(newState);
  };

  const toggleEventCategory = () => {
    const newState = !showEventCategoryDropdown;
    closeAllDropdowns();
    setShowEventCategoryDropdown(newState);
  };

  const toggleSchedule = () => {
    const newState = !showScheduleDropdown;
    closeAllDropdowns();
    setShowScheduleDropdown(newState);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container') && !target.closest('.react-datepicker')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section id="action-cards" className="py-24 md:py-32 px-6 md:px-16 relative z-10" style={{ overflow: 'visible' }}>
      <div className="max-w-7xl mx-auto" style={{ overflow: 'visible' }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center" style={{ overflow: 'visible' }}>
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:pr-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Action Cards
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-6">
              Most things get automatically routed to your databases. But when it's important—a calendar invitation, a new contact, a task—you get a card first. One tap to add, or edit whatever needs changing. You choose which databases need this.
            </p>
          </motion.div>

          {/* Right: Action Cards Stack */}
          <div className="space-y-6" style={{ overflow: 'visible' }}>
          {/* Task Card */}
          {!taskAction ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[32px] p-5 md:p-7"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 252, 241, 0.98) 0%, rgba(209, 250, 223, 0.98) 40%, rgba(167, 243, 208, 0.98) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(34, 197, 94, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              overflow: 'visible',
              zIndex: (showTaskDatePicker || showTaskCategoryDropdown || showTaskDurationDropdown) ? 50 : 30,
            }}
          >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-green-50/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 relative dropdown-container">
                  <button
                    onClick={toggleTaskDatePicker}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white/50 hover:bg-white transition-all cursor-pointer"
                  >
                    <Calendar size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                      {formatDate(taskDate)}
                    </span>
                  </button>
                  {showTaskDatePicker && (
                    <div className="absolute top-full left-0 mt-2 z-[100]">
                      <DatePicker
                        selected={taskDate}
                        onChange={(date: Date | null) => {
                          if (date) setTaskDate(date);
                          closeAllDropdowns();
                        }}
                        inline
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 relative dropdown-container">
                  <button
                    onClick={toggleTaskCategory}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r ${getCategoryColor(taskCategory)} text-white shadow-md hover:scale-105 transition-all cursor-pointer`}
                  >
                    <div className="w-3 h-3 bg-white/40 rounded-sm" />
                    <span className="text-xs font-bold uppercase tracking-wider">{taskCategory}</span>
                    <ChevronDown size={12} />
                  </button>
                  {showTaskCategoryDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[100] min-w-[140px]">
                      {categoryOptions.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setTaskCategory(category);
                            closeAllDropdowns();
                          }}
                          className={`w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 ${
                            taskCategory === category ? 'bg-slate-50 font-semibold' : ''
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(category)}`} />
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                  <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Task title */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setTaskEmoji(e.currentTarget.textContent || '🧹')}
                  className="text-2xl cursor-text hover:bg-white/30 rounded px-1 transition-colors"
                >
                  {taskEmoji}
                </span>
                <h3
                  ref={taskTitleRef}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleContentEditableBlur(e, setTaskTitle)}
                  className="text-2xl font-semibold text-slate-900 cursor-text hover:bg-white/30 rounded px-2 transition-colors outline-none"
                >
                  {taskTitle}
                </h3>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 mb-3 relative dropdown-container">
                <Hourglass size={16} className="text-slate-500" />
                <button
                  onClick={toggleTaskDuration}
                  className="flex items-center gap-2 text-slate-600 hover:bg-white/30 rounded px-2 py-1 transition-colors cursor-pointer"
                >
                  <span>{taskDuration}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {showTaskDurationDropdown && (
                  <div className="absolute top-full left-6 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[100] min-w-[120px]">
                    {durationOptions.map((duration) => (
                      <button
                        key={duration}
                        onClick={() => {
                          setTaskDuration(duration);
                          closeAllDropdowns();
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentEditableBlur(e, setTaskDescription)}
                className="text-slate-600 mb-6 cursor-text hover:bg-white/30 rounded px-2 py-1 transition-colors outline-none"
              >
                {taskDescription}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTaskAction('dismissed')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md text-red-600 font-semibold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm border border-white/40"
                >
                  <X size={14} />
                  Dismiss
                </button>
                <button
                  onClick={() => setTaskAction('added')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/30"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>
          </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-[32px] p-12 flex items-center justify-center"
              style={{
                background: taskAction === 'added'
                  ? 'linear-gradient(135deg, rgba(236, 252, 241, 0.98) 0%, rgba(209, 250, 223, 0.98) 40%, rgba(167, 243, 208, 0.98) 100%)'
                  : 'linear-gradient(135deg, rgba(254, 242, 242, 0.98) 0%, rgba(254, 226, 226, 0.98) 40%, rgba(252, 165, 165, 0.98) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: taskAction === 'added'
                  ? '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(34, 197, 94, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(239, 68, 68, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  taskAction === 'added' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {taskAction === 'added' ? (
                    <Check size={32} className="text-white" />
                  ) : (
                    <X size={32} className="text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  {taskAction === 'added' ? 'Task Added!' : 'Task Dismissed'}
                </h3>
                <p className="text-slate-600">
                  {taskAction === 'added'
                    ? 'Your task has been successfully added to your list.'
                    : 'This task has been dismissed.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* People Card */}
          {!personAction ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-[32px] p-5 md:p-7"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 254, 255, 0.98) 0%, rgba(207, 250, 254, 0.98) 40%, rgba(165, 243, 252, 0.98) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              overflow: 'visible',
              zIndex: showPersonCategoryDropdown ? 50 : 20,
            }}
          >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-50/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                {/* Category pill */}
                <div className="relative dropdown-container">
                  <button
                    onClick={togglePersonCategory}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r ${getCategoryColor(personCategory)} text-white shadow-md hover:scale-105 transition-all cursor-pointer`}
                  >
                    <Users size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">{personCategory}</span>
                    <ChevronDown size={12} />
                  </button>
                  {showPersonCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[100] min-w-[160px]">
                      {personCategoryOptions.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setPersonCategory(category);
                            closeAllDropdowns();
                          }}
                          className={`w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 ${
                            personCategory === category ? 'bg-slate-50 font-semibold' : ''
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(category)}`} />
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Person info */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setPersonInitials(e.currentTarget.textContent || 'DJ')}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 flex items-center justify-center text-2xl font-semibold text-white shadow-lg ring-4 ring-white/50 cursor-text hover:ring-amber-200 transition-all outline-none"
                  >
                    {personInitials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-3 border-white shadow-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3
                    ref={personNameRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleContentEditableBlur(e, setPersonName)}
                    className="text-2xl font-semibold text-slate-900 mb-1.5 leading-tight cursor-text hover:bg-white/30 rounded px-2 transition-colors outline-none"
                  >
                    {personName}
                  </h3>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleContentEditableBlur(e, setPersonSubtext)}
                    className="text-slate-500 text-sm cursor-text hover:bg-white/30 rounded px-2 transition-colors outline-none"
                  >
                    {personSubtext}
                  </p>
                </div>
              </div>

              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentEditableBlur(e, setPersonDescription)}
                className="text-slate-600 mb-6 cursor-text hover:bg-white/30 rounded px-2 py-1 transition-colors outline-none"
              >
                {personDescription}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPersonAction('dismissed')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md text-red-600 font-semibold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm border border-white/40"
                >
                  <X size={14} />
                  Don't Add
                </button>
                <button
                  onClick={() => setPersonAction('added')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-semibold hover:from-cyan-500 hover:to-cyan-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-400/30"
                >
                  <Users size={16} />
                  Add to Directory
                </button>
              </div>
            </div>
          </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-[32px] p-12 flex items-center justify-center"
              style={{
                background: personAction === 'added'
                  ? 'linear-gradient(135deg, rgba(236, 254, 255, 0.98) 0%, rgba(207, 250, 254, 0.98) 40%, rgba(165, 243, 252, 0.98) 100%)'
                  : 'linear-gradient(135deg, rgba(254, 242, 242, 0.98) 0%, rgba(254, 226, 226, 0.98) 40%, rgba(252, 165, 165, 0.98) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: personAction === 'added'
                  ? '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(239, 68, 68, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  personAction === 'added' ? 'bg-cyan-500' : 'bg-red-500'
                }`}>
                  {personAction === 'added' ? (
                    <Users size={32} className="text-white" />
                  ) : (
                    <X size={32} className="text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  {personAction === 'added' ? 'Added to Directory!' : 'Contact Dismissed'}
                </h3>
                <p className="text-slate-600">
                  {personAction === 'added'
                    ? 'Contact has been successfully added to your directory.'
                    : 'This contact has been dismissed.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Calendar Card */}
          {!eventAction ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative rounded-[32px] p-5 md:p-7"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.98) 0%, rgba(224, 242, 254, 0.98) 40%, rgba(186, 230, 253, 0.98) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              overflow: 'visible',
              zIndex: (showEventDatePicker || showEventCategoryDropdown || showTimeDropdown || showEventDurationDropdown || showScheduleDropdown) ? 50 : 10,
            }}
          >
            {/* Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div className="relative dropdown-container">
                  <button
                    onClick={toggleEventDatePicker}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-md text-blue-600 text-xs font-bold uppercase tracking-wider shadow-sm border border-white/50 hover:bg-white transition-all cursor-pointer"
                  >
                    <Calendar size={14} />
                    {formatDate(eventDate)}
                    <ChevronDown size={12} />
                  </button>
                  {showEventDatePicker && (
                    <div className="absolute top-full left-0 mt-2 z-[100]">
                      <DatePicker
                        selected={eventDate}
                        onChange={(date: Date | null) => {
                          if (date) setEventDate(date);
                          closeAllDropdowns();
                        }}
                        inline
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 relative dropdown-container">
                  <button
                    onClick={toggleEventCategory}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r ${getCategoryColor(eventCategory)} text-white shadow-md hover:scale-105 transition-all cursor-pointer`}
                  >
                    <Calendar size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">{eventCategory}</span>
                    <ChevronDown size={12} />
                  </button>
                  {showEventCategoryDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[100] min-w-[140px]">
                      {categoryOptions.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setEventCategory(category);
                            closeAllDropdowns();
                          }}
                          className={`w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 ${
                            eventCategory === category ? 'bg-slate-50 font-semibold' : ''
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(category)}`} />
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                  <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Event title */}
              <h3
                ref={eventTitleRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentEditableBlur(e, setEventTitle)}
                className="text-2xl font-semibold text-slate-900 mb-4 cursor-text hover:bg-white/30 rounded px-2 transition-colors outline-none"
              >
                {eventTitle}
              </h3>

              {/* Time and duration */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 relative dropdown-container">
                  <Clock size={16} className="text-blue-500" />
                  <button
                    onClick={toggleTime}
                    className="flex items-center gap-2 text-slate-600 hover:bg-white/30 rounded px-2 py-1 transition-colors cursor-pointer"
                  >
                    <span>{eventTime}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  {showTimeDropdown && (
                    <div className="absolute top-full left-4 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[100] max-h-60 overflow-y-auto">
                      {timeOptions.map((time) => (
                        <button
                          key={time}
                          onClick={() => {
                            setEventTime(time);
                            closeAllDropdowns();
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-slate-400">•</span>
                <div className="flex items-center gap-2 relative dropdown-container">
                  <Hourglass size={16} className="text-blue-500" />
                  <button
                    onClick={toggleEventDuration}
                    className="flex items-center gap-2 text-slate-600 hover:bg-white/30 rounded px-2 py-1 transition-colors cursor-pointer"
                  >
                    <span>{eventDuration}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  {showEventDurationDropdown && (
                    <div className="absolute top-full left-4 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[100] min-w-[120px]">
                      {durationOptions.map((duration) => (
                        <button
                          key={duration}
                          onClick={() => {
                            setEventDuration(duration);
                            closeAllDropdowns();
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all mb-6 group">
                <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setEventLocation(e.currentTarget.textContent || '')}
                  className={`flex-1 text-left outline-none cursor-text ${
                    eventLocation ? 'text-slate-600' : 'text-slate-500'
                  }`}
                >
                  {eventLocation || 'Add location'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setEventAction('dismissed')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/70 backdrop-blur-md text-red-600 font-semibold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm border border-white/40"
                >
                  <X size={14} />
                  Dismiss
                </button>
                <button
                  onClick={toggleSchedule}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-transparent text-blue-600 font-semibold hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all border-2 border-blue-300"
                >
                  <Calendar size={14} />
                  Schedule
                </button>
                <button
                  onClick={() => setEventAction('added')}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
                >
                  <Plus size={14} />
                  Add to Calendar
                </button>
              </div>

              {/* Schedule view - Calendar table with time slots */}
              {showScheduleDropdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white rounded-2xl border border-blue-200 overflow-hidden shadow-lg"
                >
                  {(() => {
                    const { days, timeSlots, events } = getThreeDayCalendar();

                    return (
                      <div className="p-3 overflow-x-auto">
                        <div className="min-w-[500px]">
                          {/* Header row with days */}
                          <div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-px bg-slate-200 rounded-t-lg overflow-hidden">
                            <div className="bg-white p-2"></div>
                            {days.map((day, idx) => (
                              <div
                                key={idx}
                                className={`bg-white p-2 text-center ${
                                  day.isEventDay ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className={`text-xs font-bold uppercase ${
                                  day.isEventDay ? 'text-blue-600' : 'text-slate-600'
                                }`}>
                                  {day.dayName}
                                </div>
                                <div className={`text-lg font-semibold ${
                                  day.isEventDay ? 'text-blue-600' : 'text-slate-900'
                                }`}>
                                  {day.dayNum}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Time slots grid */}
                          <div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-px bg-slate-200">
                            {timeSlots.map((time, timeIdx) => {
                              const hour = parseInt(time);
                              const isPM = time.includes('p');
                              const hour24 = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);

                              return (
                                <React.Fragment key={timeIdx}>
                                  {/* Time label */}
                                  <div className="bg-white p-2 text-xs text-slate-500 font-medium flex items-start">
                                    {time}
                                  </div>

                                  {/* Day cells */}
                                  {days.map((day, dayIdx) => {
                                    const dayEvents = events.filter(
                                      e => e.day === dayIdx && e.hour === hour24
                                    );

                                    return (
                                      <div
                                        key={dayIdx}
                                        className="bg-white p-1 min-h-[50px] relative"
                                      >
                                        {dayEvents.map((event, eventIdx) => (
                                          <motion.div
                                            key={eventIdx}
                                            animate={event.isPending ? {
                                              opacity: [0.7, 1, 0.7],
                                              scale: [1, 1.02, 1],
                                            } : {}}
                                            transition={event.isPending ? {
                                              duration: 2,
                                              repeat: Infinity,
                                              ease: "easeInOut"
                                            } : {}}
                                            className={`absolute inset-x-1 rounded-lg p-2 text-xs font-semibold ${
                                              event.isPending
                                                ? 'bg-green-100 text-green-800 border-2 border-dashed border-green-500'
                                                : event.color === 'blue' ? 'bg-blue-400 text-white' :
                                                  event.color === 'green' ? 'bg-green-400 text-white' :
                                                  event.color === 'red' ? 'bg-red-400 text-white' :
                                                  'bg-pink-400 text-white'
                                            }`}
                                            style={{
                                              height: `${event.duration * 50}px`,
                                              top: '4px',
                                            }}
                                          >
                                            {event.title}
                                          </motion.div>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </div>
          </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-[32px] p-12 flex items-center justify-center"
              style={{
                background: eventAction === 'added'
                  ? 'linear-gradient(135deg, rgba(239, 246, 255, 0.98) 0%, rgba(224, 242, 254, 0.98) 40%, rgba(186, 230, 253, 0.98) 100%)'
                  : 'linear-gradient(135deg, rgba(254, 242, 242, 0.98) 0%, rgba(254, 226, 226, 0.98) 40%, rgba(252, 165, 165, 0.98) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: eventAction === 'added'
                  ? '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(239, 68, 68, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  eventAction === 'added' ? 'bg-blue-500' : 'bg-red-500'
                }`}>
                  {eventAction === 'added' ? (
                    <Calendar size={32} className="text-white" />
                  ) : (
                    <X size={32} className="text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  {eventAction === 'added' ? 'Added to Calendar!' : 'Event Dismissed'}
                </h3>
                <p className="text-slate-600">
                  {eventAction === 'added'
                    ? 'Event has been successfully added to your calendar.'
                    : 'This event has been dismissed.'}
                </p>
              </div>
            </motion.div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
};
