import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Send } from 'lucide-react';

export const ContextualChat: React.FC = () => {
  const [selectedModels, setSelectedModels] = useState<Array<'claude' | 'gpt' | 'gemini' | 'grok'>>(['claude']);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [typingText, setTypingText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isMultiChat, setIsMultiChat] = useState<boolean>(false);

  const models = [
    { id: 'claude' as const, name: 'Claude', color: 'bg-amber-500' },
    { id: 'gpt' as const, name: 'ChatGPT', color: 'bg-emerald-500' },
    { id: 'gemini' as const, name: 'Gemini', color: 'bg-blue-500' },
    { id: 'grok' as const, name: 'Grok', color: 'bg-slate-900' },
  ];

  // Conversation examples with different models
  const conversations = [
    {
      model: 'claude' as const,
      multiChat: false,
      messages: [
        {
          type: 'user',
          text: 'What have I said about the redesign project?',
        },
        {
          type: 'ai',
          model: 'claude',
          text: 'Based on your voice notes, you mentioned prioritizing the design system first, then simplifying the user flow.',
          references: [
            { date: 'Feb 14, 2:30 PM', snippet: 'I think we should prioritize the design system first...' },
            { date: 'Feb 12, 9:15 AM', snippet: 'The key is simplifying the user flow, especially on mobile.' },
          ],
        },
      ],
    },
    {
      model: 'gemini' as const,
      multiChat: false,
      messages: [
        {
          type: 'user',
          text: 'Help me plan my work week',
        },
        {
          type: 'ai',
          model: 'gemini',
          text: "I've organized your week based on your current projects and deadlines:",
          actionCards: [
            { day: 'Monday', task: 'Team strategy meeting', time: '10:00 AM' },
            { day: 'Wednesday', task: 'Complete design system docs', time: '2:00 PM' },
            { day: 'Friday', task: 'Review mobile prototypes', time: '11:00 AM' },
          ],
        },
      ],
    },
    {
      model: 'grok' as const,
      multiChat: false,
      messages: [
        {
          type: 'user',
          text: 'What was that idea I had last week?',
        },
        {
          type: 'ai',
          model: 'grok',
          text: 'You mentioned using AI to automatically categorize incoming voice notes by project.',
          references: [
            { date: 'Feb 10, 4:15 PM', snippet: 'What if we could auto-tag notes by project using AI context?' },
          ],
        },
      ],
    },
    {
      model: 'claude' as const,
      multiChat: true,
      messages: [
        {
          type: 'user',
          text: 'Should I pivot the product strategy?',
        },
        {
          type: 'ai',
          model: 'claude',
          text: "Based on your notes, you're seeing strong engagement with voice features. I'd focus there rather than pivoting.",
          multiResponse: true,
        },
        {
          type: 'ai',
          model: 'gpt',
          text: "Your user feedback consistently mentions wanting better organization. Consider doubling down on AI categorization.",
          multiResponse: true,
        },
        {
          type: 'ai',
          model: 'gemini',
          text: "The data shows retention is highest when users integrate with their calendar. Prioritize that integration.",
          multiResponse: true,
        },
      ],
    },
  ];

  // Animation that cycles through different models and showcases multi-chat
  useEffect(() => {
    let isCancelled = false;

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const runAnimation = async () => {
      if (isCancelled) return;

      for (let convIdx = 0; convIdx < conversations.length; convIdx++) {
        if (isCancelled) return;

        const conversation = conversations[convIdx];

        // Reset for new conversation
        setVisibleMessages(0);
        setTypingText('');
        setIsTyping(false);
        setInputText('');

        // Switch model and multi-chat mode
        if (conversation.multiChat) {
          setSelectedModels(['claude', 'gpt', 'gemini']);
          setIsMultiChat(true);
        } else {
          setSelectedModels([conversation.model]);
          setIsMultiChat(false);
        }
        await sleep(600);

        // Process messages in conversation
        for (let i = 0; i < conversation.messages.length; i++) {
          if (isCancelled) return;

          const message = conversation.messages[i];

          if (message.type === 'user') {
            // Type in input field
            const text = message.text;
            for (let j = 0; j <= text.length; j++) {
              if (isCancelled) return;
              setInputText(text.slice(0, j));
              await sleep(40);
            }

            await sleep(400);

            // Send message
            setInputText('');
            setVisibleMessages(i + 1);
            await sleep(600);
          } else {
            // AI response
            setIsTyping(true);
            await sleep(800);

            setIsTyping(false);
            const text = message.text;
            for (let j = 0; j <= text.length; j++) {
              if (isCancelled) return;
              setTypingText(text.slice(0, j));
              await sleep(25);
            }

            setVisibleMessages(i + 1);
            setTypingText('');
            await sleep(conversation.multiChat ? 1000 : 1800);
          }
        }

        await sleep(2500);
      }

      if (!isCancelled) runAnimation();
    };

    runAnimation();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section id="contextual-chat" className="py-24 md:py-32 px-6 md:px-16 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Right: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:pl-8 lg:order-last"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              A ChatGPT that actually helps you.
            </h2>
            <div className="space-y-4 text-lg md:text-xl text-slate-600 leading-relaxed">
              <p>
                Tired of constantly explaining what project you're working on? This chat <em className="text-slate-900 font-medium">actually knows</em>.
              </p>
              <p>
                It references your voice notes, suggests action cards, and helps plan your work week—without you having to repeat yourself.
              </p>
              <p className="text-slate-700 font-medium">
                Choose Claude, Gemini, ChatGPT, or Grok. Or enable multi-chat to get all four perspectives on the same question—side by side.
              </p>
            </div>
          </motion.div>

          {/* Right: Chat Card Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Chat Card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Header */}
              <div className="bg-white/60 backdrop-blur-sm border-b border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-slate-700" />
                    <span className="text-lg font-semibold text-slate-900">Vois Chat</span>
                  </div>
                  <AnimatePresence>
                    {isMultiChat && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold"
                      >
                        Multi-Chat
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Model selector */}
                <div className="flex gap-2 flex-wrap">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedModels.includes(model.id)
                          ? `${model.color} text-white shadow-md`
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="px-6 py-6 space-y-6 bg-white min-h-[400px] max-h-[500px] overflow-y-auto">
                  <AnimatePresence mode="sync">
                    {conversations.find(c =>
                      (c.multiChat === isMultiChat) &&
                      (!c.multiChat ? selectedModels.includes(c.model) : true)
                    )?.messages.slice(0, visibleMessages).map((message, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        {message.type === 'user' ? (
                          <div className="flex justify-end">
                            <div className="bg-slate-100 rounded-3xl rounded-tr-md px-4 py-3 max-w-[75%]">
                              <p className="text-sm text-slate-900">{message.text}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-start">
                              <div className="bg-white rounded-3xl rounded-tl-md px-4 py-3 max-w-[85%] border border-slate-100">
                                {message.model && (
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${models.find(m => m.id === message.model)?.color}`} />
                                    <span className="text-xs font-semibold text-slate-600">
                                      {models.find(m => m.id === message.model)?.name}
                                    </span>
                                  </div>
                                )}
                                <p className="text-sm text-slate-900 leading-relaxed">{message.text}</p>
                              </div>
                            </div>

                            {/* Voice note references */}
                            {message.references && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="ml-0 space-y-2"
                              >
                                <div className="flex items-center gap-1.5 mb-2 ml-1">
                                  <FileText size={10} className="text-slate-400" />
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Voice Notes</span>
                                </div>
                                {message.references.map((ref, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="bg-blue-50 border border-blue-100 rounded-2xl p-3 max-w-[85%]"
                                  >
                                    <p className="text-[10px] font-medium text-blue-900 mb-1">{ref.date}</p>
                                    <p className="text-xs text-blue-700 leading-relaxed">"{ref.snippet}"</p>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}

                            {/* Action cards */}
                            {message.actionCards && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="ml-0 space-y-2"
                              >
                                {message.actionCards.map((card, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-3 max-w-[85%]"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-bold text-green-900">{card.day}</span>
                                      <span className="text-[10px] text-green-600">{card.time}</span>
                                    </div>
                                    <p className="text-sm text-green-800">{card.task}</p>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white rounded-3xl rounded-tl-md px-4 py-3 border border-slate-100">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 bg-slate-400 rounded-full"
                            />
                            <motion.div
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-slate-400 rounded-full"
                            />
                            <motion.div
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              className="w-2 h-2 bg-slate-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Typing text */}
                    {typingText && (
                      <motion.div
                        key="typing-text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white rounded-3xl rounded-tl-md px-4 py-3 max-w-[85%] border border-slate-100">
                          <p className="text-sm text-slate-900 leading-relaxed">
                            {typingText}
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="inline-block w-0.5 h-4 bg-slate-900 ml-0.5"
                            />
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              {/* Input bar */}
              <div className="bg-white/80 backdrop-blur-sm border-t border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                    <div className="text-sm font-medium min-h-[20px] flex items-center">
                      {inputText ? (
                        <>
                          <span className="text-slate-900">{inputText}</span>
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-0.5 h-4 bg-blue-500 ml-1"
                          />
                        </>
                      ) : (
                        <span className="text-slate-400">Ask anything...</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      inputText
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-slate-200 text-slate-400 shadow-sm scale-100'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
