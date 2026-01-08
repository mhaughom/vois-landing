import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, FileText, Lock, Smartphone, ArrowLeft, Menu, X } from 'lucide-react';

// Legal section types
type LegalSection = 'terms' | 'refund' | 'privacy' | 'eula';

const sections: { id: LegalSection; title: string; icon: React.ReactNode }[] = [
  { id: 'terms', title: 'Terms of Service', icon: <FileText size={18} /> },
  { id: 'refund', title: 'Refund Policy', icon: <Shield size={18} /> },
  { id: 'privacy', title: 'Privacy Policy', icon: <Lock size={18} /> },
  { id: 'eula', title: 'EULA (iOS)', icon: <Smartphone size={18} /> },
];

// Last updated date
const LAST_UPDATED = 'January 5, 2026';

export const Legal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<LegalSection>('terms');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle hash navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '') as LegalSection;
    if (hash && sections.find(s => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const handleSectionChange = (section: LegalSection) => {
    setActiveSection(section);
    navigate(`/legal#${section}`, { replace: true });
    setMobileMenuOpen(false);
    // Scroll to top on section change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-serif italic text-sm">V</span>
                </div>
                <span className="font-semibold text-slate-900">Legal</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
          
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
                Legal Documents
              </p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    activeSection === section.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {section.icon}
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
              
              <div className="pt-6 mt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400 px-3">
                  Last updated: {LAST_UPDATED}
                </p>
              </div>
            </nav>
          </aside>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200 shadow-lg z-40 p-4"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Jump to Section
              </p>
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mobile Table of Contents */}
          <div className="lg:hidden mb-8">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer bg-slate-50 rounded-xl px-4 py-3">
                <span className="font-medium text-slate-900">Table of Contents</span>
                <ChevronRight size={18} className="text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-2 space-y-1 px-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                      activeSection === section.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {section.icon}
                    {section.title}
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Main Content */}
          <main className="min-w-0">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="prose prose-slate max-w-none"
            >
              {activeSection === 'terms' && <TermsOfService />}
              {activeSection === 'refund' && <RefundPolicy />}
              {activeSection === 'privacy' && <PrivacyPolicy />}
              {activeSection === 'eula' && <EULA />}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Legal Footer - Norwegian Law Compliance */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-serif italic">V</span>
                </div>
                <span className="font-serif text-lg text-slate-900">Vois</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                Vois is an AI-powered voice notes application that helps you capture, 
                organize, and act on your thoughts with ease.
              </p>
            </div>
            
            <div className="md:text-right">
              <h4 className="font-semibold text-slate-900 mb-3">Company Information</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p>Vois is operated by <strong>[Your Name/Company AS]</strong></p>
                <p>Organization Number (Org.nr): <strong>[XXXXXXXXX]</strong></p>
                <p>Address: <strong>Volda, Norway</strong></p>
                <p>Contact: <a href="mailto:support@vois.app" className="text-slate-900 hover:underline">support@vois.app</a></p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Vois. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>🇳🇴 Proudly made in Norway</span>
              <span>•</span>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// SECTION COMPONENTS
// ============================================

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8 pb-6 border-b border-slate-200">
    <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-2">{title}</h1>
    {subtitle && <p className="text-slate-500">{subtitle}</p>}
    <p className="text-sm text-slate-400 mt-2">Last updated: {LAST_UPDATED}</p>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-serif text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
    <div className="text-slate-700 leading-relaxed space-y-4">{children}</div>
  </section>
);

const ImportantBox = ({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' }) => (
  <div className={`p-4 rounded-xl border-l-4 ${
    variant === 'warning' 
      ? 'bg-amber-50 border-amber-400' 
      : 'bg-blue-50 border-blue-400'
  }`}>
    <div className={`text-sm ${variant === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>
      {children}
    </div>
  </div>
);

// ============================================
// TERMS OF SERVICE
// ============================================

const TermsOfService = () => (
  <>
    <SectionHeader 
      title="Terms of Service" 
      subtitle="Please read these terms carefully before using Vois."
    />

    <SubSection title="1. Acceptance of Terms">
      <p>
        By accessing or using Vois ("the Service"), you agree to be bound by these Terms of Service 
        ("Terms"). If you do not agree to these Terms, please do not use the Service.
      </p>
      <p>
        Vois is operated by [Your Name/Company AS], a company registered in Norway. These Terms 
        constitute a legally binding agreement between you and [Your Name/Company AS].
      </p>
    </SubSection>

    <SubSection title="2. Definition of 'Lifetime Access'">
      <ImportantBox>
        <p className="font-semibold mb-2">Important Clarification:</p>
        <p>
          <strong>"Lifetime Access"</strong> refers to the lifespan of the Vois product, not the 
          lifespan of the user. Lifetime Access grants you perpetual access to Vois Pro features 
          for as long as the Vois service continues to operate.
        </p>
      </ImportantBox>
      <p className="mt-4">
        In the event that Vois is discontinued or substantially changed:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>We will provide at least <strong>30 days' advance notice</strong> to all Lifetime members via email.</li>
        <li>Where possible, we will offer data export tools to preserve your content.</li>
        <li>We reserve the right to transition to a successor service and migrate your Lifetime status.</li>
      </ul>
    </SubSection>

    <SubSection title="3. Fair Use Policy (API Protection)">
      <p>
        To ensure the stability and availability of our AI-powered features for all users, 
        Lifetime and Pro accounts are subject to a Fair Use Policy:
      </p>
      <ImportantBox variant="warning">
        <p className="font-semibold mb-2">Usage Limits:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Soft limit of <strong>500 AI Processing Credits per month</strong> (approximately 5 hours of audio transcription and processing).</li>
          <li>Credits reset on the 1st of each calendar month.</li>
          <li>Unused credits do not roll over to subsequent months.</li>
        </ul>
      </ImportantBox>
      <p className="mt-4">
        We reserve the right to temporarily throttle or suspend accounts that exhibit excessive usage 
        patterns that suggest automated bot activity, API abuse, or commercial resale of our services. 
        Affected users will be notified and given the opportunity to appeal.
      </p>
    </SubSection>

    <SubSection title="4. Beta Disclaimer">
      <ImportantBox variant="warning">
        <p className="font-semibold mb-2">Public Beta Notice:</p>
        <p>
          You expressly acknowledge that Vois is currently in <strong>Public Beta</strong>. The software 
          is provided <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> without warranty of 
          any kind, either express or implied, including but not limited to the implied warranties of 
          merchantability, fitness for a particular purpose, or non-infringement.
        </p>
      </ImportantBox>
      <p className="mt-4">
        During the Beta period:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Features may change, be modified, or be removed without prior notice.</li>
        <li>You may experience bugs, errors, or service interruptions.</li>
        <li>We appreciate your patience and feedback as we improve the service.</li>
      </ul>
    </SubSection>

    <SubSection title="5. User Responsibilities">
      <p>You agree to:</p>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Use the Service only for lawful purposes and in accordance with these Terms.</li>
        <li>Not attempt to reverse engineer, decompile, or disassemble any part of the Service.</li>
        <li>Not use the Service to process content that violates applicable laws or third-party rights.</li>
        <li>Maintain the confidentiality of your account credentials.</li>
      </ul>
    </SubSection>

    <SubSection title="6. Intellectual Property">
      <p>
        All intellectual property rights in Vois, including but not limited to software, design, 
        logos, and content, are owned by [Your Name/Company AS] or our licensors.
      </p>
      <p>
        <strong>Your content remains yours.</strong> You retain all rights to the voice recordings, 
        transcripts, and notes you create using Vois. We claim no ownership over your personal content.
      </p>
    </SubSection>

    <SubSection title="7. Limitation of Liability">
      <p>
        To the maximum extent permitted by Norwegian law and applicable EU/EEA regulations, 
        [Your Name/Company AS] shall not be liable for any indirect, incidental, special, 
        consequential, or punitive damages, including loss of profits, data, or use.
      </p>
    </SubSection>

    <SubSection title="8. Governing Law">
      <p>
        These Terms shall be governed by and construed in accordance with the laws of Norway, 
        without regard to its conflict of law provisions. Any disputes shall be subject to the 
        exclusive jurisdiction of the courts of Norway.
      </p>
    </SubSection>

    <SubSection title="9. Changes to Terms">
      <p>
        We reserve the right to modify these Terms at any time. We will notify users of any 
        material changes via email or in-app notification. Continued use of the Service after 
        such modifications constitutes acceptance of the updated Terms.
      </p>
    </SubSection>
  </>
);

// ============================================
// REFUND POLICY
// ============================================

const RefundPolicy = () => (
  <>
    <SectionHeader 
      title="Refund Policy & Right of Withdrawal" 
      subtitle="Your rights as a consumer under Norwegian and EU/EEA law."
    />

    <SubSection title="1. Our Commitment">
      <p>
        At Vois, we want you to be completely satisfied with your purchase. We offer different 
        refund policies depending on where you made your purchase.
      </p>
    </SubSection>

    <SubSection title="2. Website Purchases (Stripe)">
      <p className="font-semibold text-slate-900 mb-2">
        Founder's Edition & Direct Web Purchases:
      </p>
      
      <ImportantBox>
        <p className="font-semibold mb-2">🛡️ 30-Day Money-Back Guarantee</p>
        <p>
          We offer a <strong>full 30-day money-back guarantee</strong> for all Founder's Edition 
          purchases made directly through our website via Stripe. If you're not satisfied with 
          Vois for any reason, simply contact us within 30 days of purchase for a full refund.
        </p>
      </ImportantBox>

      <div className="mt-6">
        <h4 className="font-semibold text-slate-900 mb-2">How to Request a Refund:</h4>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Email <a href="mailto:support@vois.app" className="text-blue-600 hover:underline">support@vois.app</a> with subject line "Refund Request"</li>
          <li>Include your order confirmation number or email used for purchase</li>
          <li>We will process your refund within 5-7 business days</li>
          <li>Refunds will be credited to the original payment method</li>
        </ol>
      </div>
    </SubSection>

    <SubSection title="3. EU/EEA Right of Withdrawal (Angrerettloven)">
      <ImportantBox variant="warning">
        <p className="font-semibold mb-2">⚖️ Important Legal Notice for EU/EEA Consumers:</p>
        <p className="mb-3">
          Under the EU Consumer Rights Directive (and Norwegian Consumer Purchase Act / Angrerettloven), 
          consumers generally have a <strong>14-day right of withdrawal</strong> for distance purchases.
        </p>
        <p className="mb-3">
          However, by purchasing the Vois Founder's Edition (digital content) and gaining 
          <strong> immediate access</strong> to the service, you <strong>expressly acknowledge and consent</strong> 
          to the following:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>The digital content will be made available to you immediately upon purchase.</li>
          <li>You understand that you will lose your statutory 14-day right of withdrawal once performance begins.</li>
          <li>You expressly consent to this arrangement.</li>
        </ul>
        <p>
          <strong>Our 30-Day Money-Back Guarantee replaces and exceeds the standard 14-day withdrawal right</strong>, 
          giving you more time to evaluate Vois risk-free.
        </p>
      </ImportantBox>
    </SubSection>

    <SubSection title="4. App Store Purchases (Apple)">
      <ImportantBox>
        <p className="font-semibold mb-2">📱 Apple App Store Purchases:</p>
        <p>
          <strong>Vois cannot process refunds</strong> for any purchases made through the Apple App Store 
          (including subscriptions and in-app purchases). These transactions are processed and managed 
          exclusively by Apple Inc.
        </p>
      </ImportantBox>

      <div className="mt-4">
        <h4 className="font-semibold text-slate-900 mb-2">To request a refund for App Store purchases:</h4>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>
            Visit Apple's <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Report a Problem</a> page
          </li>
          <li>Sign in with your Apple ID</li>
          <li>Find the Vois purchase in your purchase history</li>
          <li>Select "Request a refund" and follow Apple's instructions</li>
        </ol>
        <p className="mt-4 text-sm text-slate-600">
          All App Store refund decisions are made solely by Apple according to their 
          <a href="https://www.apple.com/legal/internet-services/itunes/us/terms.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Terms and Conditions</a>.
        </p>
      </div>
    </SubSection>

    <SubSection title="5. Non-Refundable Situations">
      <p>Refunds may not be granted in the following circumstances:</p>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Requests made after the 30-day guarantee period has expired</li>
        <li>Abuse of the refund policy (e.g., repeated purchases and refunds)</li>
        <li>Account suspension due to Terms of Service violations</li>
        <li>Purchases made through third-party resellers or unauthorized channels</li>
      </ul>
    </SubSection>

    <SubSection title="6. Contact Us">
      <p>
        For any questions regarding refunds or your consumer rights, please contact us at:
      </p>
      <div className="mt-4 p-4 bg-slate-50 rounded-xl">
        <p><strong>Email:</strong> <a href="mailto:support@vois.app" className="text-blue-600 hover:underline">support@vois.app</a></p>
        <p><strong>Response Time:</strong> Within 48 business hours</p>
      </div>
    </SubSection>
  </>
);

// ============================================
// PRIVACY POLICY
// ============================================

const PrivacyPolicy = () => (
  <>
    <SectionHeader 
      title="Privacy Policy" 
      subtitle="How we collect, use, and protect your personal data under GDPR."
    />

    <SubSection title="1. Data Controller">
      <div className="p-4 bg-slate-50 rounded-xl">
        <p><strong>Company:</strong> [Your Name/Company AS]</p>
        <p><strong>Location:</strong> Volda, Norway (EEA)</p>
        <p><strong>Contact:</strong> <a href="mailto:privacy@vois.app" className="text-blue-600 hover:underline">privacy@vois.app</a></p>
      </div>
      <p className="mt-4">
        [Your Name/Company AS] is the data controller responsible for your personal data 
        collected through the Vois application and website.
      </p>
    </SubSection>

    <SubSection title="2. Data We Collect">
      <h4 className="font-semibold text-slate-900 mb-2">Account Information:</h4>
      <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
        <li>Email address (for account creation and communication)</li>
        <li>Name (optional, for personalization)</li>
        <li>Payment information (processed by Stripe; we do not store card details)</li>
      </ul>

      <h4 className="font-semibold text-slate-900 mb-2">Usage Data:</h4>
      <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
        <li>App usage analytics (anonymized)</li>
        <li>Feature interaction data</li>
        <li>Error logs and crash reports</li>
      </ul>

      <h4 className="font-semibold text-slate-900 mb-2">Content Data:</h4>
      <ul className="list-disc list-inside space-y-1 ml-4">
        <li>Voice recordings (processed for transcription)</li>
        <li>Transcribed text and notes</li>
        <li>AI-generated summaries and tasks</li>
      </ul>
    </SubSection>

    <SubSection title="3. AI Training Policy">
      <ImportantBox>
        <p className="font-semibold mb-2">🔒 Your Data is NOT Used for AI Training</p>
        <p>
          We do <strong>NOT</strong> use your private voice notes, transcripts, or any personal 
          content to train our public AI models (Large Language Models / LLMs). Your data remains 
          your property and is never shared with third parties for machine learning purposes.
        </p>
      </ImportantBox>
      <p className="mt-4">
        When we process your voice recordings through AI, the content is:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Sent securely to our AI provider for real-time transcription</li>
        <li>Processed and immediately returned to you</li>
        <li>Not retained by the AI provider for training purposes</li>
        <li>Subject to our data processing agreements with sub-processors</li>
      </ul>
    </SubSection>

    <SubSection title="4. Local-First Architecture">
      <ImportantBox>
        <p className="font-semibold mb-2">📱 Privacy by Design</p>
        <p>
          Vois employs a <strong>local-first architecture</strong>. This means:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Voice recordings are processed and then stored on your device or your personal cloud database.</li>
          <li>We do <strong>not</strong> retain audio files on our servers after processing.</li>
          <li>Your notes and transcripts sync securely to your account but remain encrypted.</li>
        </ul>
      </ImportantBox>
    </SubSection>

    <SubSection title="5. Sub-Processors">
      <p>We use the following third-party services to operate Vois:</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left p-3 border border-slate-200 font-semibold">Service</th>
              <th className="text-left p-3 border border-slate-200 font-semibold">Purpose</th>
              <th className="text-left p-3 border border-slate-200 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-slate-200"><strong>OpenAI</strong></td>
              <td className="p-3 border border-slate-200">AI Intelligence (Transcription, Summarization)</td>
              <td className="p-3 border border-slate-200">USA (EU Data Processing Agreement)</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200"><strong>Supabase</strong></td>
              <td className="p-3 border border-slate-200">Database & Authentication</td>
              <td className="p-3 border border-slate-200">EU (Frankfurt)</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200"><strong>Stripe</strong></td>
              <td className="p-3 border border-slate-200">Payment Processing</td>
              <td className="p-3 border border-slate-200">USA (EU Data Processing Agreement)</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200"><strong>Vercel</strong></td>
              <td className="p-3 border border-slate-200">Website Hosting</td>
              <td className="p-3 border border-slate-200">Global CDN</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SubSection>

    <SubSection title="6. Legal Basis for Processing (GDPR Article 6)">
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li><strong>Contract Performance:</strong> Processing necessary to provide the Vois service you requested.</li>
        <li><strong>Legitimate Interest:</strong> Analytics to improve our service (with appropriate safeguards).</li>
        <li><strong>Consent:</strong> Marketing communications (you can withdraw consent at any time).</li>
        <li><strong>Legal Obligation:</strong> Tax records and compliance with applicable laws.</li>
      </ul>
    </SubSection>

    <SubSection title="7. Your Rights (GDPR)">
      <p>Under the General Data Protection Regulation, you have the right to:</p>
      <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
        <li><strong>Erasure:</strong> Request deletion of your data ("Right to be Forgotten")</li>
        <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
        <li><strong>Restriction:</strong> Limit how we process your data</li>
        <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
        <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
      </ul>
      <p className="mt-4">
        To exercise these rights, contact us at <a href="mailto:privacy@vois.app" className="text-blue-600 hover:underline">privacy@vois.app</a>. 
        We will respond within 30 days.
      </p>
    </SubSection>

    <SubSection title="8. Data Retention">
      <ul className="list-disc list-inside space-y-2 ml-4">
        <li>Active accounts: Data retained for the duration of your account</li>
        <li>Deleted accounts: Data erased within 30 days of account deletion</li>
        <li>Financial records: Retained for 7 years as required by Norwegian law</li>
      </ul>
    </SubSection>

    <SubSection title="9. Data Security">
      <p>We implement appropriate technical and organizational measures to protect your data:</p>
      <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
        <li>TLS/SSL encryption for all data in transit</li>
        <li>AES-256 encryption for data at rest</li>
        <li>Regular security audits and penetration testing</li>
        <li>Employee access controls and training</li>
      </ul>
    </SubSection>

    <SubSection title="10. Contact & Complaints">
      <p>For privacy-related inquiries:</p>
      <div className="mt-4 p-4 bg-slate-50 rounded-xl">
        <p><strong>Privacy Contact:</strong> <a href="mailto:privacy@vois.app" className="text-blue-600 hover:underline">privacy@vois.app</a></p>
      </div>
      <p className="mt-4">
        If you believe your rights have been violated, you have the right to lodge a complaint with:
      </p>
      <div className="mt-2 p-4 bg-slate-50 rounded-xl">
        <p><strong>Datatilsynet (Norwegian Data Protection Authority)</strong></p>
        <p>Website: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.datatilsynet.no</a></p>
      </div>
    </SubSection>
  </>
);

// ============================================
// EULA (Apple Requirement)
// ============================================

const EULA = () => (
  <>
    <SectionHeader 
      title="End User License Agreement (EULA)" 
      subtitle="Terms for using Vois on iOS devices."
    />

    <SubSection title="1. Apple Licensed Application">
      <p>
        Your use of Vois on iOS devices is governed by the standard 
        <strong> Apple Licensed Application End User License Agreement (EULA)</strong>, 
        in addition to these Terms of Service.
      </p>
      
      <ImportantBox>
        <p className="font-semibold mb-2">📱 Apple Standard EULA</p>
        <p>
          For the complete Apple EULA terms, please visit:
        </p>
        <a 
          href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-2 text-blue-600 hover:underline break-all"
        >
          https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
        </a>
      </ImportantBox>
    </SubSection>

    <SubSection title="2. Acknowledgements">
      <p>You acknowledge that:</p>
      <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
        <li>
          This EULA is concluded between you and [Your Name/Company AS] only, and not with Apple Inc.
        </li>
        <li>
          [Your Name/Company AS], not Apple, is solely responsible for the Licensed Application 
          (Vois) and its content.
        </li>
        <li>
          Apple has no obligation to provide any maintenance or support services for Vois.
        </li>
        <li>
          In the event of any failure of Vois to conform to any applicable warranty, you may notify 
          Apple, and Apple will refund the purchase price (if any) for the app. To the maximum extent 
          permitted by applicable law, Apple has no other warranty obligation with respect to Vois.
        </li>
        <li>
          Apple is not responsible for addressing any claims by you or third parties relating to 
          Vois or your possession and use of Vois.
        </li>
        <li>
          Apple and its subsidiaries are third-party beneficiaries of this EULA, and upon your 
          acceptance, Apple will have the right to enforce this EULA against you as a third-party 
          beneficiary.
        </li>
      </ul>
    </SubSection>

    <SubSection title="3. Intellectual Property">
      <p>
        In the event of any third-party claim that Vois or your possession and use of Vois 
        infringes that third party's intellectual property rights, [Your Name/Company AS], 
        not Apple, will be solely responsible for the investigation, defense, settlement, 
        and discharge of any such intellectual property infringement claim.
      </p>
    </SubSection>

    <SubSection title="4. Legal Compliance">
      <p>
        You represent and warrant that:
      </p>
      <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
        <li>You are not located in a country subject to a U.S. Government embargo.</li>
        <li>You are not listed on any U.S. Government list of prohibited or restricted parties.</li>
        <li>You will comply with all applicable third-party terms of agreement when using Vois.</li>
      </ul>
    </SubSection>

    <SubSection title="5. Contact Information">
      <p>
        For any questions or concerns regarding the iOS application or this EULA, please contact:
      </p>
      <div className="mt-4 p-4 bg-slate-50 rounded-xl">
        <p><strong>Developer:</strong> [Your Name/Company AS]</p>
        <p><strong>Email:</strong> <a href="mailto:support@vois.app" className="text-blue-600 hover:underline">support@vois.app</a></p>
        <p><strong>Address:</strong> Volda, Norway</p>
      </div>
    </SubSection>
  </>
);

export default Legal;


