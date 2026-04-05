import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, FileText, Lock, Smartphone, ArrowLeft, Menu, X } from 'lucide-react';

// Legal section types
type LegalSection = 'terms' | 'refund' | 'privacy' | 'eula';

// Last updated date
const LAST_UPDATED = 'February 25, 2026';

interface LegalProps {
  defaultSection?: LegalSection;
}

export const Legal = ({ defaultSection }: LegalProps) => {
  const { t } = useTranslation('legal');
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<LegalSection>(defaultSection || 'terms');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections: { id: LegalSection; title: string; icon: React.ReactNode }[] = [
    { id: 'terms', title: t('sections.terms'), icon: <FileText size={18} /> },
    { id: 'refund', title: t('sections.refund'), icon: <Shield size={18} /> },
    { id: 'privacy', title: t('sections.privacy'), icon: <Lock size={18} /> },
    { id: 'eula', title: t('sections.eula'), icon: <Smartphone size={18} /> },
  ];

  // Handle hash navigation (only if no defaultSection prop)
  useEffect(() => {
    if (defaultSection) return; // Skip hash handling if defaultSection is provided
    const hash = location.hash.replace('#', '') as LegalSection;
    if (hash && sections.find(s => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash, defaultSection]);

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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors flex-shrink-0"
              >
                <ArrowLeft size={16} />
              </Link>
              <div className="flex items-center gap-2.5 bg-slate-100 rounded-full pl-1.5 pr-4 py-1.5">
                <img src="/Logo/habos-icon.svg" alt={t('nav.logoAlt')} className="h-6 w-6" />
                <span className="font-semibold text-sm text-slate-900">{t('nav.title')}</span>
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
                {t('sidebar.documentsLabel')}
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
                  {t('sidebar.lastUpdatedLabel')} {LAST_UPDATED}
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
                {t('mobile.jumpToSection')}
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
                <span className="font-medium text-slate-900">{t('mobile.tableOfContents')}</span>
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
                <img src="/Logo/habos-icon.svg" alt={t('footer.logoAlt')} className="h-8 w-8" />
                <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                {t('footer.description')}
              </p>
            </div>

            <div className="md:text-right">
              <h4 className="font-semibold text-slate-900 mb-3">{t('footer.companyInfoHeading')}</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p>{t('footer.operatedBy')} <strong>HABOS AI AS</strong></p>
                <p>{t('footer.orgNumber')} <strong>{t('footer.orgValue')}</strong></p>
                <p>{t('footer.address')} <strong>{t('footer.addressValue')}</strong></p>
                <p>{t('footer.contact')} <a href={`mailto:${t('footer.contactEmail')}`} className="text-slate-900 hover:underline">{t('footer.contactEmail')}</a></p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>🇳🇴 {t('footer.madeIn')}</span>
              <span>•</span>
              <span>{t('footer.gdpr')}</span>
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

const TermsOfService = () => {
  const { t } = useTranslation('legal');
  const features = t('terms.s2.features', { returnObjects: true }) as string[];
  const s3Rows = t('terms.s3.rows', { returnObjects: true }) as string[][];
  const s3Headers = t('terms.s3.tableHeaders', { returnObjects: true }) as string[];
  const s3AutoItems = t('terms.s3.autoRenewal.items', { returnObjects: true }) as string[];
  const s4Items = t('terms.s4.items', { returnObjects: true }) as string[];
  const s6Items = t('terms.s6.items', { returnObjects: true }) as string[];

  return (
    <>
      <SectionHeader
        title={t('terms.title')}
        subtitle={t('terms.subtitle')}
      />

      <SubSection title={t('terms.s1.title')}>
        <p>{t('terms.s1.p1')}</p>
        <p>{t('terms.s1.p2')}</p>
      </SubSection>

      <SubSection title={t('terms.s2.title')}>
        <p>{t('terms.s2.p1')}</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
          {features.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('terms.s3.title')}>
        <p>{t('terms.s3.p1')}</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                {s3Headers.map((h, i) => (
                  <th key={i} className="text-left p-3 border border-slate-200 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s3Rows.map((row, i) => (
                <tr key={i}>
                  <td className="p-3 border border-slate-200"><strong>{row[0]}</strong></td>
                  <td className="p-3 border border-slate-200">{row[1]}</td>
                  <td className="p-3 border border-slate-200">{row[2]}</td>
                  <td className="p-3 border border-slate-200">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">
          Vois also offers a <strong>Free</strong> tier with limited usage (5 voice recordings, 5 chat messages, 1 custom app, and up to 3 minutes per recording) at no cost.
        </p>

        <ImportantBox>
          <p className="font-semibold mb-2">{t('terms.s3.autoRenewal.title')}</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {s3AutoItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </ImportantBox>

        <p className="mt-4">
          See our <a href="/legal#refund" className="text-blue-600 hover:underline">{t('terms.s3.refundLink')}</a> for information about refunds.
        </p>

        <p className="mt-2">
          For more details, see our{' '}
          <a href="/legal#privacy" className="text-blue-600 hover:underline">{t('terms.s3.privacyLink')}</a> and{' '}
          <a href="/legal#eula" className="text-blue-600 hover:underline">{t('terms.s3.eulaLink')}</a>.
        </p>
      </SubSection>

      <SubSection title={t('terms.s4.title')}>
        <p>{t('terms.s4.intro')}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          {s4Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('terms.s5.title')}>
        <p>
          <strong>Your content remains yours.</strong> {t('terms.s5.p1')}
        </p>
        <p className="mt-4">{t('terms.s5.p2')}</p>
      </SubSection>

      <SubSection title={t('terms.s6.title')}>
        <p>{t('terms.s6.p1')}</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
          {s6Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('terms.s7.title')}>
        <p>{t('terms.s7.p1')}</p>
      </SubSection>

      <SubSection title={t('terms.s8.title')}>
        <p>{t('terms.s8.p1')}</p>
      </SubSection>

      <SubSection title={t('terms.s9.title')}>
        <p>{t('terms.s9.p1')}</p>
      </SubSection>

      <SubSection title={t('terms.s10.title')}>
        <p>
          Questions? Contact us at <a href="mailto:hello@habos.ai" className="text-blue-600 hover:underline">hello@habos.ai</a>
        </p>
      </SubSection>
    </>
  );
};

// ============================================
// REFUND POLICY
// ============================================

const RefundPolicy = () => {
  const { t } = useTranslation('legal');
  const steps = t('refund.s1.steps', { returnObjects: true }) as string[];

  return (
    <>
      <SectionHeader
        title={t('refund.title')}
        subtitle={t('refund.subtitle')}
      />

      <SubSection title={t('refund.s1.title')}>
        <p>{t('refund.s1.p1')}</p>

        <div className="mt-6">
          <h4 className="font-semibold text-slate-900 mb-3">{t('refund.s1.howToTitle')}</h4>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>
              Visit <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">reportaproblem.apple.com</a>
            </li>
            {steps.slice(1).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        <p className="mt-6 text-slate-600">{t('refund.s1.note')}</p>
      </SubSection>

      <SubSection title={t('refund.s2.title')}>
        <p>
          Contact us at <a href="mailto:hello@habos.ai" className="text-blue-600 hover:underline">hello@habos.ai</a>
        </p>
      </SubSection>
    </>
  );
};

// ============================================
// PRIVACY POLICY
// ============================================

const PrivacyPolicy = () => {
  const { t } = useTranslation('legal');
  const accountItems = t('privacy.s2.accountItems', { returnObjects: true }) as string[];
  const usageItems = t('privacy.s2.usageItems', { returnObjects: true }) as string[];
  const contentItems = t('privacy.s2.contentItems', { returnObjects: true }) as string[];
  const s3Items = t('privacy.s3.items', { returnObjects: true }) as string[];
  const s4Items = t('privacy.s4.items', { returnObjects: true }) as string[];
  const dataSentItems = t('privacy.s5.dataSentItems', { returnObjects: true }) as string[];
  const providers = t('privacy.s5.providers', { returnObjects: true }) as Array<{ name: string; dataReceived: string; purpose: string; policyLabel: string; policyUrl: string }>;
  const protectionItems = t('privacy.s5.protectionItems', { returnObjects: true }) as string[];
  const s6Rows = t('privacy.s6.rows', { returnObjects: true }) as string[][];
  const s6Headers = t('privacy.s6.tableHeaders', { returnObjects: true }) as string[];
  const necessaryItems = t('privacy.s7.necessaryItems', { returnObjects: true }) as string[];
  const analyticsItems = t('privacy.s7.analyticsItems', { returnObjects: true }) as string[];
  const s8Items = t('privacy.s8.items', { returnObjects: true }) as string[];
  const s9Items = t('privacy.s9.items', { returnObjects: true }) as string[];
  const s10Items = t('privacy.s10.items', { returnObjects: true }) as string[];
  const s11Items = t('privacy.s11.items', { returnObjects: true }) as string[];

  return (
    <>
      <SectionHeader
        title={t('privacy.title')}
        subtitle={t('privacy.subtitle')}
      />

      <SubSection title={t('privacy.s1.title')}>
        <div className="p-4 bg-slate-50 rounded-xl">
          <p><strong>{t('privacy.s1.companyLabel')}</strong> {t('privacy.s1.companyValue')}</p>
          <p><strong>{t('privacy.s1.locationLabel')}</strong> {t('privacy.s1.locationValue')}</p>
          <p><strong>{t('privacy.s1.contactLabel')}</strong> <a href={`mailto:${t('privacy.s1.contactEmail')}`} className="text-blue-600 hover:underline">{t('privacy.s1.contactEmail')}</a></p>
        </div>
        <p className="mt-4">{t('privacy.s1.p1')}</p>
      </SubSection>

      <SubSection title={t('privacy.s2.title')}>
        <h4 className="font-semibold text-slate-900 mb-2">{t('privacy.s2.accountHeading')}</h4>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          {accountItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        <h4 className="font-semibold text-slate-900 mb-2">{t('privacy.s2.usageHeading')}</h4>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          {usageItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        <h4 className="font-semibold text-slate-900 mb-2">{t('privacy.s2.contentHeading')}</h4>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {contentItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('privacy.s3.title')}>
        <ImportantBox>
          <p className="font-semibold mb-2">🔒 {t('privacy.s3.boxTitle')}</p>
          <p>{t('privacy.s3.boxText')}</p>
        </ImportantBox>
        <p className="mt-4">{t('privacy.s3.p1')}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          {s3Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('privacy.s4.title')}>
        <ImportantBox>
          <p className="font-semibold mb-2">📱 {t('privacy.s4.boxTitle')}</p>
          <p>{t('privacy.s4.boxIntro')}</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {s4Items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </ImportantBox>
      </SubSection>

      <SubSection title={t('privacy.s5.title')}>
        <ImportantBox>
          <p className="font-semibold mb-2">{t('privacy.s5.boxTitle')}</p>
          <p>{t('privacy.s5.boxText')}</p>
        </ImportantBox>

        <h4 className="font-semibold text-slate-900 mb-2 mt-6">{t('privacy.s5.dataSentHeading')}</h4>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
          {dataSentItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        <h4 className="font-semibold text-slate-900 mb-3">{t('privacy.s5.providersHeading')}</h4>

        <div className="space-y-4">
          {providers.map((provider, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl">
              <p className="font-semibold text-slate-900">{provider.name}</p>
              <p className="text-sm text-slate-600 mt-1">
                <strong>{t('privacy.s5.dataReceivedLabel')}</strong> {provider.dataReceived}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                <strong>{t('privacy.s5.purposeLabel')}</strong> {provider.purpose}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                <a href={provider.policyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{provider.policyLabel}</a>
              </p>
            </div>
          ))}
        </div>

        <h4 className="font-semibold text-slate-900 mb-2 mt-6">{t('privacy.s5.protectionHeading')}</h4>
        <ul className="list-disc list-inside space-y-2 ml-4">
          {protectionItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        <h4 className="font-semibold text-slate-900 mb-2 mt-6">{t('privacy.s5.choicesHeading')}</h4>
        <p>{t('privacy.s5.choicesText')}</p>
      </SubSection>

      <SubSection title={t('privacy.s6.title')}>
        <p>{t('privacy.s6.p1')}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                {s6Headers.map((h, i) => (
                  <th key={i} className="text-left p-3 border border-slate-200 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s6Rows.map((row, i) => (
                <tr key={i}>
                  <td className="p-3 border border-slate-200"><strong>{row[0]}</strong></td>
                  <td className="p-3 border border-slate-200">{row[1]}</td>
                  <td className="p-3 border border-slate-200">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600">{t('privacy.s6.footnote')}</p>
      </SubSection>

      <SubSection title={t('privacy.s7.title')}>
        <p>Our website (<a href="https://habos.ai" className="text-blue-600 hover:underline">habos.ai</a>) uses the following technologies:</p>

        <h4 className="font-semibold text-slate-900 mb-2 mt-4">{t('privacy.s7.necessaryHeading')}</h4>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          {necessaryItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
        <p className="mb-4">{t('privacy.s7.necessaryNote')}</p>

        <h4 className="font-semibold text-slate-900 mb-2">{t('privacy.s7.analyticsHeading')}</h4>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          {analyticsItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        <p>You can change your tracking preferences at any time via the <strong>Cookie Settings</strong> link in our website footer.</p>
      </SubSection>

      <SubSection title={t('privacy.s8.title')}>
        <ul className="list-disc list-inside space-y-2 ml-4">
          {s8Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('privacy.s9.title')}>
        <p>{t('privacy.s9.p1')}</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
          {s9Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
        <p className="mt-4">
          {t('privacy.s9.contactNote').split('hello@habos.ai')[0]}
          <a href="mailto:hello@habos.ai" className="text-blue-600 hover:underline">hello@habos.ai</a>
          {t('privacy.s9.contactNote').split('hello@habos.ai')[1]}
        </p>
      </SubSection>

      <SubSection title={t('privacy.s10.title')}>
        <ul className="list-disc list-inside space-y-2 ml-4">
          {s10Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('privacy.s11.title')}>
        <p>{t('privacy.s11.p1')}</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
          {s11Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('privacy.s12.title')}>
        <p>{t('privacy.s12.p1')}</p>
        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
          <p><strong>{t('privacy.s12.privacyContactLabel')}</strong> <a href={`mailto:${t('privacy.s12.privacyContactEmail')}`} className="text-blue-600 hover:underline">{t('privacy.s12.privacyContactEmail')}</a></p>
        </div>
        <p className="mt-4">{t('privacy.s12.p2')}</p>
        <div className="mt-2 p-4 bg-slate-50 rounded-xl">
          <p><strong>{t('privacy.s12.authorityName')}</strong></p>
          <p>{t('privacy.s12.authorityWebsiteLabel')} <a href={t('privacy.s12.authorityWebsiteUrl')} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('privacy.s12.authorityWebsiteDisplay')}</a></p>
        </div>
      </SubSection>
    </>
  );
};

// ============================================
// EULA (Apple Requirement)
// ============================================

const EULA = () => {
  const { t } = useTranslation('legal');
  const s2Items = t('eula.s2.items', { returnObjects: true }) as string[];
  const s4Items = t('eula.s4.items', { returnObjects: true }) as string[];
  const s5Rows = t('eula.s5.rows', { returnObjects: true }) as string[][];
  const s5Headers = t('eula.s5.tableHeaders', { returnObjects: true }) as string[];
  const s5AutoItems = t('eula.s5.autoRenewal.items', { returnObjects: true }) as string[];

  return (
    <>
      <SectionHeader
        title={t('eula.title')}
        subtitle={t('eula.subtitle')}
      />

      <SubSection title={t('eula.s1.title')}>
        <p>
          {t('eula.s1.p1').split('Apple Licensed Application End User License Agreement (EULA)')[0]}
          <strong> Apple Licensed Application End User License Agreement (EULA)</strong>
          {t('eula.s1.p1').split('Apple Licensed Application End User License Agreement (EULA)')[1]}
        </p>

        <ImportantBox>
          <p className="font-semibold mb-2">📱 {t('eula.s1.boxTitle')}</p>
          <p>{t('eula.s1.boxText')}</p>
          <a
            href={t('eula.s1.eulaUrl')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 hover:underline break-all"
          >
            {t('eula.s1.eulaUrl')}
          </a>
        </ImportantBox>
      </SubSection>

      <SubSection title={t('eula.s2.title')}>
        <p>{t('eula.s2.intro')}</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
          {s2Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('eula.s3.title')}>
        <p>{t('eula.s3.p1')}</p>
      </SubSection>

      <SubSection title={t('eula.s4.title')}>
        <p>{t('eula.s4.intro')}</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
          {s4Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SubSection>

      <SubSection title={t('eula.s5.title')}>
        <p>{t('eula.s5.p1')}</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                {s5Headers.map((h, i) => (
                  <th key={i} className="text-left p-3 border border-slate-200 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s5Rows.map((row, i) => (
                <tr key={i}>
                  <td className="p-3 border border-slate-200"><strong>{row[0]}</strong></td>
                  <td className="p-3 border border-slate-200">{row[1]}</td>
                  <td className="p-3 border border-slate-200">{row[2]}</td>
                  <td className="p-3 border border-slate-200">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">
          A <strong>Free</strong> tier is also available at no cost, with limited usage (5 voice recordings, 5 chat messages, 1 custom app, up to 3 minutes per recording).
        </p>

        <ImportantBox>
          <p className="font-semibold mb-2">{t('eula.s5.autoRenewal.title')}</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {s5AutoItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </ImportantBox>

        <p className="mt-4">
          For full details, see our{' '}
          <a href="/legal#terms" className="text-blue-600 hover:underline">{t('eula.s5.termsLink')}</a> and{' '}
          <a href="/legal#privacy" className="text-blue-600 hover:underline">{t('eula.s5.privacyLink')}</a>.
        </p>
      </SubSection>

      <SubSection title={t('eula.s6.title')}>
        <p>{t('eula.s6.p1')}</p>
        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
          <p><strong>{t('eula.s6.developerLabel')}</strong> {t('eula.s6.developerValue')}</p>
          <p><strong>{t('eula.s6.emailLabel')}</strong> <a href={`mailto:${t('eula.s6.emailValue')}`} className="text-blue-600 hover:underline">{t('eula.s6.emailValue')}</a></p>
          <p><strong>{t('eula.s6.addressLabel')}</strong> {t('eula.s6.addressValue')}</p>
        </div>
      </SubSection>
    </>
  );
};

export default Legal;
