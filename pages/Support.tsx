import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Clock, HelpCircle, RefreshCw, CreditCard, Smartphone, Shield } from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <Link
              to="/"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2.5 bg-slate-100 rounded-full pl-1.5 pr-4 py-1.5">
              <img src="/Logo/vois-logo.svg" alt="Vois" className="h-6 w-6" />
              <span className="font-semibold text-sm text-slate-900">Support</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">How can we help?</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            We're here to help you get the most out of Vois. Find answers below or reach out directly.
          </p>
        </motion.div>

        {/* Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-50 rounded-2xl p-8 mb-16"
        >
          <h2 className="text-xl font-serif text-slate-900 mb-6">Contact Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                <Mail size={18} className="text-slate-700" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 text-sm mb-1">Email Support</h3>
                <a href="mailto:hello@tryvois.com" className="text-blue-600 hover:underline text-sm">
                  hello@tryvois.com
                </a>
                <p className="text-slate-500 text-xs mt-1">For all inquiries and support requests</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                <Clock size={18} className="text-slate-700" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 text-sm mb-1">Response Time</h3>
                <p className="text-slate-700 text-sm">Within 24 hours</p>
                <p className="text-slate-500 text-xs mt-1">Monday through Friday</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-xl font-serif text-slate-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQItem
              icon={<HelpCircle size={18} />}
              question="What is Vois?"
              answer="Vois is an AI-powered voice notes app that helps you capture, organize, and act on your thoughts. Available on iPhone, Apple Watch, and Mac."
            />
            <FAQItem
              icon={<Smartphone size={18} />}
              question="Which devices does Vois support?"
              answer="Vois is available on iPhone, Apple Watch, and Mac. You can download it from the Apple App Store. Your data syncs seamlessly across all your devices."
            />
            <FAQItem
              icon={<CreditCard size={18} />}
              question="How does billing work?"
              answer="Vois offers subscription plans billed monthly or annually. You can manage your subscription through the App Store on your Apple device. All payments are processed securely through Apple."
            />
            <FAQItem
              icon={<RefreshCw size={18} />}
              question="How do I cancel my subscription?"
              answer="You can cancel your subscription at any time through the App Store. Go to Settings > Apple ID > Subscriptions on your iPhone, find Vois, and tap Cancel. You'll continue to have access until the end of your current billing period."
            />
            <FAQItem
              icon={<CreditCard size={18} />}
              question="Can I get a refund?"
              answer={<>Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us at <a href="mailto:hello@tryvois.com" className="text-blue-600 hover:underline">hello@tryvois.com</a> or view our full <Link to="/legal#refund" className="text-blue-600 hover:underline">Refund Policy</Link>.</>}
            />
            <FAQItem
              icon={<Shield size={18} />}
              question="Is my data secure?"
              answer={<>Your privacy and data security are our top priority. We are fully GDPR compliant and use encryption to protect your data. Read our <Link to="/Privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> for full details.</>}
            />
            <FAQItem
              icon={<MessageCircle size={18} />}
              question="How do I report a bug or request a feature?"
              answer={<>We'd love to hear from you! Send us an email at <a href="mailto:hello@tryvois.com" className="text-blue-600 hover:underline">hello@tryvois.com</a> with a description of the issue or your feature idea, and we'll get back to you.</>}
            />
          </div>
        </motion.div>

        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="border-t border-slate-200 pt-12"
        >
          <h2 className="text-xl font-serif text-slate-900 mb-6">Company Information</h2>
          <div className="bg-slate-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-600">
              <div className="space-y-2">
                <p><span className="font-medium text-slate-900">Company:</span> VOIS AI AS</p>
                <p><span className="font-medium text-slate-900">Org. Number:</span> 936 920 594</p>
                <p><span className="font-medium text-slate-900">Location:</span> Alsvåg, Norway</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium text-slate-900">Email:</span> <a href="mailto:hello@tryvois.com" className="text-blue-600 hover:underline">hello@tryvois.com</a></p>
                <p><span className="font-medium text-slate-900">Website:</span> <a href="https://tryvois.com" className="text-blue-600 hover:underline">tryvois.com</a></p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Vois AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link to="/Privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <span>&middot;</span>
              <Link to="/Terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FAQItem = ({ icon, question, answer }: { icon: React.ReactNode; question: string; answer: React.ReactNode }) => (
  <details className="group">
    <summary className="flex items-center gap-3 cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-xl px-5 py-4 transition-colors">
      <span className="text-slate-400 group-open:text-slate-700 transition-colors shrink-0">{icon}</span>
      <span className="font-medium text-slate-900 text-sm flex-1">{question}</span>
      <svg
        className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </summary>
    <div className="px-5 pb-4 pt-2 ml-8 text-sm text-slate-600 leading-relaxed">
      {answer}
    </div>
  </details>
);

export default Support;
