import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mic, Calendar, ListTodo, Mail, Headphones, BarChart3,
  FileBarChart, Bot, Search, User, Briefcase, Users, Building2,
  LifeBuoy, BookOpen, Shield, ScrollText, ChevronDown, Menu, X,
  Settings, Network, Brain, Sparkles, MessageSquare, Phone,
  Globe, ShoppingCart, CreditCard, Truck, MapPin, FileText,
  Presentation, Wrench, ClipboardList, UserCheck, Landmark,
  Watch, Route, Clock, LayoutGrid, Megaphone, PenTool,
  Ticket, FormInput, Link2, BookMarked, FolderOpen,
} from 'lucide-react';
import { Analytics } from '../lib/analytics';

// Helper function to scroll to a section
export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// ── Menu data types ────────────────────────────────────────────────────────

type MenuItem = {
  icon: React.FC<{ className?: string; size?: number }>;
  label: string;
  desc: string;
  href: string;
};

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

type MenuCategory = {
  label: string;
  sections: MenuSection[];
};

// ── HABOS menu data (Work / business platform) ────────────────────────────

const habosMenuData: MenuCategory[] = [
  {
    label: 'Product',
    sections: [
      {
        title: 'Key Features',
        items: [
          { icon: Sparkles, label: 'HABOS Assistant', desc: 'Your AI business partner', href: '/work/assistant' },
          { icon: Brain, label: 'HABOS Brain', desc: '19-source semantic search', href: '/work/brain' },
          { icon: Headphones, label: 'HABOS Meetings', desc: 'AI briefs & action items', href: '/work/meeting-notes' },
          { icon: FileBarChart, label: 'HABOS Reports', desc: 'Voice-first AI reporting', href: '/work/reports' },
          { icon: FileText, label: 'HABOS Briefs', desc: 'Auto-generated meeting prep', href: '/work/briefs' },
          { icon: Bot, label: 'HABOS Agents', desc: 'Autonomous AI workflows', href: '/work/agents' },
          { icon: Mic, label: 'Smart Router', desc: 'Voice → multi-system actions', href: '/work/voice-notes' },
          { icon: Watch, label: 'Watch Assistant', desc: 'Full AI on your wrist', href: '/work/watch' },
        ],
      },
      {
        title: 'Workspace',
        items: [
          { icon: Mic, label: 'Voice Notes', desc: 'Talk, we handle the rest', href: '/work/voice-notes' },
          { icon: Calendar, label: 'Calendar', desc: 'Auto-fill focus blocks', href: '/work/calendar' },
          { icon: ListTodo, label: 'Tasks', desc: '7-factor AI prioritization', href: '/work/tasks' },
          { icon: Mail, label: 'Email', desc: 'Unified inbox + voice mode', href: '/work/email' },
          { icon: BarChart3, label: 'Projects', desc: 'Critical path & dependencies', href: '/work/projects' },
          { icon: Presentation, label: 'Slides', desc: 'AI decks with live data', href: '/work/slides' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { icon: ClipboardList, label: 'Operations', desc: 'Health scoring & cadences', href: '/work/operations' },
          { icon: Search, label: 'Research', desc: 'AI deep dives & citations', href: '/work/research' },
          { icon: Truck, label: 'Dispatch & Jobs', desc: 'Day-of board & status flow', href: '/work/dispatch' },
          { icon: Route, label: 'Routes', desc: 'Geocoded stop ordering', href: '/work/routes' },
          { icon: Clock, label: 'Time Tracking', desc: 'Clock in/out & billable hours', href: '/work/time-tracking' },
          { icon: MapPin, label: 'Team Map', desc: 'Real-time field locations', href: '/work/team-map' },
        ],
      },
      {
        title: 'Commerce',
        items: [
          { icon: UserCheck, label: 'CRM & Sales', desc: 'Pipeline, kanban & AI strategy', href: '/work/crm' },
          { icon: ShoppingCart, label: 'Products & Orders', desc: 'Variants, inventory & payments', href: '/work/products' },
          { icon: Calendar, label: 'Bookings', desc: 'Availability & auto-orders', href: '/work/bookings' },
          { icon: Landmark, label: 'Finance', desc: 'Receivables, payables & P&L', href: '/work/finance' },
          { icon: CreditCard, label: 'Stripe Payments', desc: 'Direct bank payouts', href: '/work/payments' },
          { icon: Link2, label: 'Scheduling Links', desc: 'Calendly-style public booking', href: '/work/scheduling-links' },
        ],
      },
      {
        title: 'Marketing',
        items: [
          { icon: Globe, label: 'Website Builder', desc: 'AI sites with live widgets', href: '/work/website-builder' },
          { icon: Megaphone, label: 'Marketing Hub', desc: 'Campaigns & GTM analysis', href: '/work/marketing' },
          { icon: PenTool, label: 'Creative Studio', desc: 'AI content & social publishing', href: '/work/creative-studio' },
          { icon: LayoutGrid, label: 'Funnels', desc: 'Email/SMS automation flows', href: '/work/funnels' },
          { icon: Globe, label: 'Custom Domains', desc: 'Domain + email + SSL in one', href: '/work/domains' },
          { icon: Wrench, label: 'Scraper', desc: 'Website intelligence & brand extraction', href: '/work/scraper' },
        ],
      },
      {
        title: 'Team & Support',
        items: [
          { icon: Users, label: 'Team & Org Chart', desc: 'Drag-and-drop org structure', href: '/work/org-chart' },
          { icon: MessageSquare, label: 'Unified Messenger', desc: 'Every channel, one timeline', href: '/work/messenger' },
          { icon: Phone, label: 'Telephony', desc: 'AI receptionist & SMS assistant', href: '/work/telephony' },
          { icon: Ticket, label: 'Tickets', desc: 'SLA timers & auto-escalation', href: '/work/tickets' },
          { icon: FormInput, label: 'Forms', desc: '20+ field types & routing rules', href: '/work/forms' },
          { icon: BookMarked, label: 'Playbooks', desc: 'SOP library & drag-to-assign', href: '/work/playbooks' },
          { icon: FolderOpen, label: 'Files & Docs', desc: 'Media library & AI reader', href: '/work/files' },
          { icon: User, label: 'People', desc: 'Every relationship, one view', href: '/work/people' },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    sections: [
      {
        items: [
          { icon: User, label: 'VOIS Personal', desc: 'Your personal operating system', href: 'https://tryvois.com' },
          { icon: Briefcase, label: 'For Work', desc: 'Supercharge your productivity', href: '/work' },
          { icon: Users, label: 'Teams', desc: 'Collaborate with AI', href: '/work' },
          { icon: Building2, label: 'Enterprise', desc: 'Scale with intelligence', href: '/work' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    sections: [
      {
        items: [
          { icon: LifeBuoy, label: 'Support', desc: 'Get help from our team', href: '/support' },
          { icon: BookOpen, label: 'Documentation', desc: 'Guides & API reference', href: '/support' },
          { icon: Shield, label: 'Privacy Policy', desc: 'How we protect your data', href: '/Privacy' },
          { icon: ScrollText, label: 'Terms of Service', desc: 'Our service agreement', href: '/Terms' },
        ],
      },
    ],
  },
];

// ── VOIS menu data (Personal / consumer product) ──────────────────────────

const voisMenuData: MenuCategory[] = [
  {
    label: 'Features',
    sections: [
      {
        items: [
          { icon: Mic, label: 'Voice Capture', desc: 'Talk, we handle the rest', href: '#' },
          { icon: Brain, label: 'AI Assistant', desc: 'Your personal AI partner', href: '#' },
          { icon: Calendar, label: 'Calendar', desc: 'Auto-fill focus blocks', href: '#' },
          { icon: ListTodo, label: 'Tasks', desc: 'AI prioritization', href: '#' },
          { icon: Watch, label: 'Watch', desc: 'Full AI on your wrist', href: '#' },
          { icon: Sparkles, label: 'Custom Apps', desc: 'Build your own spaces', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    sections: [
      {
        items: [
          { icon: Briefcase, label: 'HABOS for Work', desc: 'The full business platform', href: 'https://habos.ai' },
          { icon: LifeBuoy, label: 'Support', desc: 'Get help from our team', href: '/support' },
          { icon: Shield, label: 'Privacy Policy', desc: 'How we protect your data', href: '/Privacy' },
          { icon: ScrollText, label: 'Terms of Service', desc: 'Our service agreement', href: '/Terms' },
        ],
      },
    ],
  },
];

// ── Mega-menu cluster groupings ─────────────────────────────────────────────
// Groups the Product sections into 3 logical clusters for the two-tier layout

const megaClusters = [
  { title: 'Platform', indices: [0, 1] },      // Key Features + Workspace
  { title: 'Operations', indices: [2, 3] },     // Operations + Commerce
  { title: 'Growth', indices: [4, 5] },         // Marketing + Team & Support
];

// ── Brand configs ───────────────────────────────────────────────────────────

const brandConfig = {
  vois: {
    logo: '/Logo/vois-logo.svg',
    name: 'VOIS',
    tagline: 'by HABOS',
    homeLink: '/',
    ctaLabel: 'Join Waitlist',
    workLink: 'https://habos.ai',
    workLabel: 'HABOS for Work',
  },
  habos: {
    logo: '/Logo/habos-icon.svg',
    name: 'HABOS',
    tagline: 'AI Power, Human Control',
    homeLink: '/work',
    ctaLabel: 'Join Waitlist',
    workLink: undefined,
    workLabel: undefined,
  },
} as const;

// ── Animation variants ──────────────────────────────────────────────────────

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } },
  exit: { opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } },
};

const staggerItems = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const itemVariant = {
  hidden: { opacity: 0, x: -4 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

const mobileOverlay = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const mobileAccordion = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.25 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.25 } },
};

// ── Component ───────────────────────────────────────────────────────────────

export type NavbarVariant = 'vois' | 'habos';

interface NavbarProps {
  variant?: NavbarVariant;
  onCycleBg?: () => void;
  bgVariant?: number;
  bgIntensity?: number;
  onBgIntensityChange?: (value: number) => void;
  onOpenWaitlist?: () => void;
  onResetDemo?: () => void;
  isDemoActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'habos', onOpenWaitlist, onResetDemo, isDemoActive }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);

  const brand = brandConfig[variant];
  const menuData = habosMenuData;

  const handleGetEarlyAccess = () => {
    Analytics.waitlistModalOpened('navbar');
    onOpenWaitlist?.();
  };

  const handleMouseEnter = useCallback((label: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setActiveDropdown(label);
  }, []);

  const handleMouseLeave = useCallback(() => {
    leaveTimeoutRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 pt-6 md:pt-8 pointer-events-none"
      >
        {/* ── Logo ────────────────────────────────────────────────────── */}
        {isDemoActive && onResetDemo ? (
          <button onClick={onResetDemo} className="pointer-events-auto cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 shadow-lg"
            >
              <img src={brand.logo} alt={brand.name} className="h-9 w-9" />
              <div className="flex flex-col">
                <span className="font-black text-3xl tracking-tight text-slate-900 leading-none">{brand.name}</span>
                <span className="text-[8px] font-semibold tracking-[0.15em] uppercase text-slate-400 leading-tight">{brand.tagline}</span>
              </div>
            </motion.div>
          </button>
        ) : (
          <Link to={brand.homeLink} className="pointer-events-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 shadow-lg"
            >
              <img src={brand.logo} alt={brand.name} className="h-9 w-9" />
              <div className="flex flex-col">
                <span className="font-black text-3xl tracking-tight text-slate-900 leading-none">{brand.name}</span>
                <span className="text-[8px] font-semibold tracking-[0.15em] uppercase text-slate-400 leading-tight">{brand.tagline}</span>
              </div>
            </motion.div>
          </Link>
        )}

        {/* ── Desktop pill menu ───────────────────────────────────────── */}
        <div className="pointer-events-auto hidden md:flex items-center bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-lg pl-1.5 pr-1.5 py-1">
          {menuData.map((category, ci) => (
            <div
              key={category.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(category.label)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Trigger */}
              <button
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-150 rounded-full ${
                  activeDropdown === category.label
                    ? 'text-slate-900 bg-slate-100/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                {category.label}
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    activeDropdown === category.label ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown (non-mega only — mega renders outside nav to avoid transform containment) */}
              <AnimatePresence>
                {activeDropdown === category.label && category.sections.length <= 3 && (
                  <div
                    className="absolute top-full pt-3"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                    onMouseEnter={() => handleMouseEnter(category.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="relative bg-white backdrop-blur-2xl rounded-2xl border border-slate-200/80 overflow-hidden pointer-events-auto"
                      style={{
                        minWidth: category.sections.length > 1 ? '560px' : '300px',
                        boxShadow: '0 20px 60px -15px rgba(0,0,0,0.15), 0 8px 20px -8px rgba(0,0,0,0.08)',
                      }}
                    >
                      <div className="h-[2px] bg-gradient-to-r from-blue-400/0 via-blue-400/60 to-blue-400/0" />
                      <motion.div
                        variants={staggerItems}
                        initial="hidden"
                        animate="visible"
                        className={category.sections.length > 1 ? 'grid grid-cols-3 gap-5 p-5' : 'p-5'}
                      >
                        {category.sections.map((section, si) => (
                          <div key={si}>
                            {section.title && (
                              <p className="font-semibold text-slate-400 uppercase tracking-widest mb-3 text-[11px] px-3">
                                {section.title}
                              </p>
                            )}
                            <div className="space-y-0.5">
                              {section.items.map((item) => (
                                <motion.a
                                  key={item.label}
                                  href={item.href}
                                  variants={itemVariant}
                                  className="group flex items-start gap-2.5 rounded-xl hover:bg-slate-50/80 transition-all duration-150 px-3 py-2.5"
                                >
                                  <div className="flex-shrink-0 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 flex items-center justify-center transition-all duration-200 w-8 h-8">
                                    <item.icon
                                      size={15}
                                      className="text-slate-400 group-hover:text-blue-600 transition-colors duration-200"
                                    />
                                  </div>
                                  <div className="min-w-0 pt-0.5">
                                    <p className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors text-[13px]">
                                      {item.label}
                                    </p>
                                    <p className="text-slate-400 group-hover:text-slate-500 mt-0.5 leading-snug transition-colors text-[11px] leading-relaxed">
                                      {item.desc}
                                    </p>
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200/60 mx-1" />

          {/* CTA */}
          <motion.button
            onClick={handleGetEarlyAccess}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            {brand.ctaLabel}
          </motion.button>
        </div>

        {/* ── Mobile hamburger ────────────────────────────────────────── */}
        <motion.button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto md:hidden flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-lg"
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={18} className="text-slate-700" />
              </motion.div>
            ) : (
              <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Menu size={18} className="text-slate-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.nav>

      {/* ── Mega dropdown (outside nav to avoid transform containment) ── */}
      <AnimatePresence>
        {menuData.map(category =>
          category.sections.length > 3 && activeDropdown === category.label ? (
            <div
              key={category.label}
              className="fixed pt-3 z-50 pointer-events-auto"
              style={{ top: '70px', left: '24px', right: '24px' }}
              onMouseEnter={() => handleMouseEnter(category.label)}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative bg-white backdrop-blur-2xl rounded-2xl border border-slate-200/80 overflow-hidden"
                style={{
                  width: '100%',
                  maxHeight: 'calc(100vh - 90px)',
                  boxShadow: '0 20px 60px -15px rgba(0,0,0,0.15), 0 8px 20px -8px rgba(0,0,0,0.08)',
                }}
              >
                <div className="h-[2px] bg-gradient-to-r from-blue-400/0 via-blue-400/60 to-blue-400/0" />
                <motion.div
                  variants={staggerItems}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-3 gap-0 overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 94px)' }}
                >
                  {megaClusters.map((cluster, ci) => (
                    <div key={cluster.title} className={ci > 0 ? 'border-l border-slate-100' : ''}>
                      {/* Cluster header */}
                      <div className="px-5 pt-4 pb-1.5 flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-800 tracking-wide uppercase">
                          {cluster.title}
                        </span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                      {/* Sub-sections */}
                      {cluster.indices.map(idx => {
                        const section = category.sections[idx];
                        if (!section) return null;
                        return (
                          <div key={idx} className="px-4 pb-3">
                            {section.title && (
                              <p className="font-semibold text-slate-400 uppercase tracking-widest mb-1.5 text-[10px] px-1.5 pt-1">
                                {section.title}
                              </p>
                            )}
                            <div className="space-y-0.5">
                              {section.items.map((item) => (
                                <motion.a
                                  key={item.label}
                                  href={item.href}
                                  variants={itemVariant}
                                  className="group flex items-start gap-2.5 rounded-xl hover:bg-slate-50/80 transition-all duration-150 px-1.5 py-1.5"
                                >
                                  <div className="flex-shrink-0 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 flex items-center justify-center transition-all duration-200 w-7 h-7">
                                    <item.icon
                                      size={13}
                                      className="text-slate-400 group-hover:text-blue-600 transition-colors duration-200"
                                    />
                                  </div>
                                  <div className="min-w-0 pt-0.5">
                                    <p className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors text-[12px] leading-tight">
                                      {item.label}
                                    </p>
                                    <p className="text-slate-400 group-hover:text-slate-500 mt-0.5 leading-snug transition-colors text-[10px]">
                                      {item.desc}
                                    </p>
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          ) : null
        )}
      </AnimatePresence>

      {/* ── Mobile menu overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-white backdrop-blur-2xl overflow-y-auto overscroll-contain"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)' }}
          >
            <div className="px-6 pb-10">
              {menuData.map((category) => (
                <div key={category.label} className="border-b border-slate-100">
                  <button
                    onClick={() =>
                      setMobileExpanded(
                        mobileExpanded === category.label ? null : category.label
                      )
                    }
                    className="w-full flex items-center justify-between py-4"
                  >
                    <span className="text-lg font-semibold text-slate-900">
                      {category.label}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-200 ${
                        mobileExpanded === category.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {mobileExpanded === category.label && (
                      <motion.div
                        variants={mobileAccordion}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="pb-4">
                          {category.sections.map((section, si) => (
                            <div key={si} className="mb-2">
                              {section.title && (
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 px-2">
                                  {section.title}
                                </p>
                              )}
                              {section.items.map((item) => (
                                <a
                                  key={item.label}
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center gap-3 px-2 py-3 rounded-xl active:bg-slate-50 transition-colors"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <item.icon size={16} className="text-slate-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-800">
                                      {item.label}
                                    </p>
                                    <p className="text-xs text-slate-400">{item.desc}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Mobile CTA */}
              <motion.button
                onClick={() => {
                  handleGetEarlyAccess();
                  setMobileMenuOpen(false);
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3.5 rounded-full text-sm font-semibold bg-slate-900 text-white shadow-lg"
              >
                {brand.ctaLabel}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
