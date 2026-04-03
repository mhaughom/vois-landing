import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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
  Lightbulb, Zap, AudioLines, Hand, Rocket, UsersRound,
  Stethoscope, HardHat, Palette, UtensilsCrossed, Home, Scissors,
  GraduationCap, Dumbbell,
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
  icon: React.FC<{ className?: string; size?: number; style?: React.CSSProperties }>;
  color?: string;
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
        items: [
          { icon: MessageSquare, color: '#3b82f6', label: 'Communication', desc: 'Email, Messenger, Phone, Support Tickets', href: '/work/communication' },
          { icon: Calendar, color: '#8b5cf6', label: 'Scheduling & Bookings', desc: 'Calendar, Bookings, Scheduling Links', href: '/work/scheduling' },
          { icon: Truck, color: '#f59e0b', label: 'Jobs & Operations', desc: 'Dispatch, Routes, Projects, Tasks, Time Tracking', href: '/work/jobs-operations' },
          { icon: CreditCard, color: '#22c55e', label: 'Sales & Payments', desc: 'CRM, Products, Invoicing, Payments', href: '/work/sales-payments' },
          { icon: Mic, color: '#ef4444', label: 'Voice & AI', desc: 'Voice Notes, Meeting Notes, Assistant, Playbooks', href: '/work/voice-ai' },
          { icon: Globe, color: '#06b6d4', label: 'Website & Marketing', desc: 'Website Builder, Social, Email Campaigns', href: '/work/website-marketing' },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    sections: [
      {
        items: [
          { icon: Wrench, color: '#f59e0b', label: 'Service Businesses', desc: 'Plumbers to consultants to therapists', href: '/solutions/service-businesses' },
          { icon: ShoppingCart, color: '#22c55e', label: 'Product Businesses', desc: 'Shops to e-commerce to manufacturers', href: '/solutions/product-businesses' },
          { icon: Palette, color: '#ec4899', label: 'Creative Businesses', desc: 'Agencies to photographers to studios', href: '/solutions/creative-businesses' },
          { icon: MapPin, color: '#ef4444', label: 'Field Operations', desc: 'Construction to delivery to property mgmt', href: '/solutions/field-operations' },
          { icon: Users, color: '#3b82f6', label: 'Teams & Startups', desc: 'Building a company with 2-50 people', href: '/solutions/teams-startups' },
          { icon: User, color: '#8b5cf6', label: 'Solo Founders', desc: 'Freelancers to one-person companies', href: '/solutions/solo-founders' },
        ],
      },
    ],
  },
  {
    label: 'Philosophy',
    sections: [
      {
        title: 'Intelligence You Control',
        items: [
          { icon: Shield, color: '#22c55e', label: 'The Airlock', desc: 'AI proposes. You decide.', href: '/philosophy/the-airlock' },
          { icon: Bot, color: '#8b5cf6', label: 'One Assistant', desc: 'Ask anything, from anywhere', href: '/philosophy/one-assistant' },
          { icon: Brain, color: '#ec4899', label: 'Capture Your Brain', desc: 'Catch ideas before they fade', href: '/philosophy/capture-your-brain' },
        ],
      },
      {
        title: 'Fast by Design',
        items: [
          { icon: Zap, color: '#ef4444', label: 'Suggestions, Not Menus', desc: 'Read. Tap. Done.', href: '/philosophy/suggestions-not-menus' },
          { icon: LayoutGrid, color: '#3b82f6', label: 'Two Interfaces', desc: 'Screens for you, APIs for agents', href: '/philosophy/two-interfaces' },
          { icon: Mic, color: '#06b6d4', label: 'Speed of Thought', desc: 'Voice in, tap out', href: '/philosophy/speed-of-thought' },
          { icon: Watch, color: '#f59e0b', label: 'Always Within Reach', desc: 'Watch, phone, lock screen', href: '/philosophy/always-within-reach' },
        ],
      },
      {
        title: 'Built for Your Business',
        items: [
          { icon: Sparkles, color: '#a855f7', label: 'Everything in One Place', desc: 'One login, every tool', href: '/philosophy/everything-in-one-place' },
          { icon: Users, color: '#f97316', label: 'Built for Teams', desc: 'Same truth, different lenses', href: '/philosophy/built-for-teams' },
          { icon: Wrench, color: '#8b5cf6', label: 'Your Software, Your Way', desc: 'Flexible by design', href: '/philosophy/your-software-your-way' },
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

// ── Product cluster sub-pages ──────────────────────────────────────────────
// When a cluster is selected, these pages appear in a secondary nav bar

const PRODUCT_CLUSTERS: Record<string, { label: string; href: string }[]> = {
  'Communication': {
    overview: '/work/communication',
    pages: [
      { label: 'Email', href: '/work/email' },
      { label: 'Messenger', href: '/work/messenger' },
      { label: 'Phone', href: '/work/telephony' },
      { label: 'Support Tickets', href: '/work/tickets' },
    ],
  },
  'Scheduling & Bookings': {
    overview: '/work/scheduling',
    pages: [
      { label: 'Calendar', href: '/work/calendar' },
      { label: 'Bookings', href: '/work/bookings' },
      { label: 'Scheduling Links', href: '/work/scheduling-links' },
    ],
  },
  'Jobs & Operations': {
    overview: '/work/jobs-operations',
    pages: [
      { label: 'Dispatch', href: '/work/dispatch' },
      { label: 'Routes', href: '/work/routes' },
      { label: 'Projects', href: '/work/projects' },
      { label: 'Tasks', href: '/work/tasks' },
      { label: 'Time Tracking', href: '/work/time-tracking' },
    ],
  },
  'Sales & Payments': {
    overview: '/work/sales-payments',
    pages: [
      { label: 'CRM', href: '/work/crm' },
      { label: 'Products', href: '/work/products' },
      { label: 'Invoicing', href: '/work/finance' },
      { label: 'Payments', href: '/work/payments' },
    ],
  },
  'Voice & AI': {
    overview: '/work/voice-ai',
    pages: [
      { label: 'Voice Notes', href: '/work/voice-notes' },
      { label: 'Meeting Notes', href: '/work/meeting-notes' },
      { label: 'Assistant', href: '/work/assistant' },
      { label: 'Playbooks', href: '/work/playbooks' },
    ],
  },
  'Website & Marketing': {
    overview: '/work/website-marketing',
    pages: [
      { label: 'Website Builder', href: '/work/website-builder' },
      { label: 'Creative Studio', href: '/work/creative-studio' },
      { label: 'Marketing', href: '/work/marketing' },
    ],
  },
};

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
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const staggerItems = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
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

// Skip nav entrance animation after first mount (persists across remounts)
let navHasAnimated = false;

// Detect cluster from a path synchronously
function detectCluster(path: string): string | null {
  for (const [cluster, data] of Object.entries(PRODUCT_CLUSTERS)) {
    if (data.overview === path || data.pages.some(p => p.href === path)) {
      return cluster;
    }
  }
  return null;
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'habos', onOpenWaitlist, onResetDemo, isDemoActive }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const skipEntrance = navHasAnimated;
  useEffect(() => { navHasAnimated = true; }, []);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileClusterExpanded, setMobileClusterExpanded] = useState<string | null>(null);
  const [activeCluster, setActiveCluster] = useState<string | null>(() => detectCluster(location.pathname));
  const [navExpanded, setNavExpanded] = useState(false);
  const leaveTimeoutRef = useRef<number | null>(null);
  const rightPillRef = useRef<HTMLDivElement>(null);
  const centerPillRef = useRef<HTMLDivElement>(null);
  const [rightPillTop, setRightPillTop] = useState<number | null>(null);
  const [pillsOverlap, setPillsOverlap] = useState(false);

  const brand = brandConfig[variant];
  const menuData = habosMenuData;
  const isVois = variant === 'vois';

  // Keep cluster in sync when URL changes (for in-app navigation without remount)
  useEffect(() => {
    setActiveCluster(detectCluster(location.pathname));
  }, [location.pathname]);

  // Measure right pill position to align center pill — single RAF + observer, no polling
  useEffect(() => {
    const measure = () => {
      if (rightPillRef.current) {
        const top = rightPillRef.current.getBoundingClientRect().top;
        if (top > 0) setRightPillTop(top);
      }
    };
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    if (rightPillRef.current) ro.observe(rightPillRef.current);
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [location.pathname]);

  // Check if centered cluster pill would overlap the right pill when dropdowns are visible.
  // Estimate center pill width from page labels to avoid async DOM measurement.
  const DROPDOWN_NAV_WIDTH = 350;
  const RIGHT_PILL_BASE = 220;
  const CHAR_WIDTH = 7.5; // approx px per character at text-sm
  const PILL_PAD = 32 + 12; // px padding per link (px-4 = 32) + container padding (pl-1.5 + pr-1.5 = 12)

  useEffect(() => {
    if (!activeCluster) {
      setPillsOverlap(false);
      return;
    }
    const pages = PRODUCT_CLUSTERS[activeCluster]?.pages;
    if (!pages) return;
    const estimatedW = pages.reduce((sum, p) => sum + p.label.length * CHAR_WIDTH + PILL_PAD, 0) + 12;
    const check = () => {
      const windowW = window.innerWidth;
      const navPadding = 48;
      const centerRight = windowW / 2 + estimatedW / 2;
      const rightLeftWithDropdowns = windowW - navPadding - RIGHT_PILL_BASE - DROPDOWN_NAV_WIDTH;
      setPillsOverlap(centerRight + 24 > rightLeftWithDropdowns);
    };
    check();
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('resize', check); };
  }, [activeCluster, location.pathname]);

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
        initial={skipEntrance ? false : { y: -100 }}
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
              className="flex items-center gap-2.5 sm:gap-4 bg-white/80 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-slate-100 shadow-lg"
            >
              <img src={brand.logo} alt={brand.name} className="h-6 w-6 sm:h-9 sm:w-9" />
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-3xl tracking-tight text-slate-900 leading-none">{brand.name}</span>
                <span className="text-[7px] sm:text-[8px] font-semibold tracking-[0.15em] uppercase text-slate-400 leading-tight">{brand.tagline}</span>
              </div>
            </motion.div>
          </button>
        ) : (
          <Link to={brand.homeLink} className="pointer-events-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2.5 sm:gap-4 bg-white/80 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-slate-100 shadow-lg"
            >
              <img src={brand.logo} alt={brand.name} className="h-6 w-6 sm:h-9 sm:w-9" />
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-3xl tracking-tight text-slate-900 leading-none">{brand.name}</span>
                <span className="text-[7px] sm:text-[8px] font-semibold tracking-[0.15em] uppercase text-slate-400 leading-tight">{brand.tagline}</span>
              </div>
            </motion.div>
          </Link>
        )}

        {/* ── Desktop pill menu ───────────────────────────────────────── */}
        {isVois ? (
          /* VOIS: simple nav — just "VOIS for Work" link + Try Now CTA */
          <div className="pointer-events-auto hidden md:flex items-center bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-lg pl-1.5 pr-1.5 py-1">
            <a
              href="https://habos.ai"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all duration-150 rounded-full"
            >
              VOIS for Work
            </a>
            <div className="w-px h-5 bg-slate-200/60 mx-1" />
            <motion.button
              onClick={handleGetEarlyAccess}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Try Now
            </motion.button>
          </div>
        ) : (
        <>{/* ── Center: cluster pill ──────────────────────────────── */}
        {activeCluster && PRODUCT_CLUSTERS[activeCluster]?.pages && (
        <div
          className="hidden md:flex flex-col items-center pointer-events-none fixed left-0 z-50"
          style={{
            top: rightPillTop ?? undefined,
            right: navExpanded && pillsOverlap && rightPillRef.current
              ? `${rightPillRef.current.offsetWidth + 64}px`
              : '0px',
          }}
        >
          {/* Thin category label pill — floats above */}
          <div className="pointer-events-auto flex items-center gap-2 absolute -top-5">
            <Link
              to={PRODUCT_CLUSTERS[activeCluster].overview}
              className={`px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full whitespace-nowrap transition-colors duration-150 ${
                location.pathname === PRODUCT_CLUSTERS[activeCluster].overview
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200/80 text-slate-500 hover:text-slate-700'
              }`}
            >
              {activeCluster}
            </Link>
            <button
              onClick={() => setActiveCluster(null)}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
          {/* Main page selection pill — matches right side pill */}
          <div
            ref={centerPillRef}
            className="pointer-events-auto flex items-center bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-lg pl-1.5 pr-1.5 py-1"
          >
            <LayoutGroup>
              {PRODUCT_CLUSTERS[activeCluster].pages.map((page) => {
                const isActive = location.pathname === page.href;
                return (
                  <Link
                    key={page.href}
                    to={page.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-150 ${
                      isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="cluster-active-pill"
                        className="absolute inset-0 bg-slate-900 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{page.label}</span>
                  </Link>
                );
              })}
            </LayoutGroup>
          </div>
        </div>
        )}

        {/* ── Right: dropdowns + CTA ─────────────────────────────── */}
        <div ref={rightPillRef} className="pointer-events-auto hidden md:flex items-center bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-lg pl-1.5 pr-1.5 py-1">

            {/* Dropdown nav items — hidden when overlapping, unless force-expanded */}
            <div className={`flex items-center ${pillsOverlap && !navExpanded ? 'hidden' : ''}`}>
            {menuData.map((category) => (
              <div
                key={category.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.label)}
                onMouseLeave={handleMouseLeave}
              >
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
                          width: '340px',
                          boxShadow: '0 20px 60px -15px rgba(0,0,0,0.15), 0 8px 20px -8px rgba(0,0,0,0.08)',
                        }}
                      >
                        <div className="h-[2px] bg-gradient-to-r from-blue-400/0 via-blue-400/60 to-blue-400/0" />
                        <motion.div
                          variants={staggerItems}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 gap-y-0.5 p-4"
                        >
                          {category.sections.flatMap(s => s.items).map((item) => {
                            const isCluster = category.label === 'Product' && !!PRODUCT_CLUSTERS[item.label];
                            return (
                            <motion.a
                              key={item.label}
                              href={isCluster ? undefined : item.href}
                              onClick={isCluster ? (e: React.MouseEvent) => {
                                e.preventDefault();
                                setActiveCluster(item.label);
                                setActiveDropdown(null);
                                setNavExpanded(false);
                                navigate(item.href);
                              } : undefined}
                              variants={itemVariant}
                              className={`group flex items-start gap-2.5 rounded-xl hover:bg-slate-50/80 transition-all duration-150 px-3 py-2.5 ${isCluster ? 'cursor-pointer' : ''}`}
                            >
                              <item.icon
                                size={16}
                                className="flex-shrink-0 mt-0.5"
                                style={{ color: item.color || '#94a3b8' }}
                              />
                              <div className="min-w-0 pt-0.5">
                                <p className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors text-[13px]">
                                  {item.label}
                                </p>
                                <p className="text-slate-400 group-hover:text-slate-500 mt-0.5 transition-colors text-[11px] leading-relaxed">
                                  {item.desc}
                                </p>
                              </div>
                            </motion.a>
                            );
                          })}
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            </div>

            {/* Toggle arrow — shown when dropdowns are hidden due to overlap */}
            {pillsOverlap && activeCluster && (
              <button
                onClick={() => setNavExpanded(!navExpanded)}
                className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50/80 transition-all duration-150"
              >
                <ChevronDown size={14} className={`transition-transform duration-200 ${navExpanded ? 'rotate-180' : '-rotate-90'}`} />
              </button>
            )}

            {/* Divider + CTA — always visible */}
            <div className="w-px h-5 bg-slate-200/60 mx-1" />
            <motion.button
              onClick={handleGetEarlyAccess}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              {brand.ctaLabel}
            </motion.button>
            <motion.a
              href="/login"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="ml-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm"
              style={{ backgroundColor: '#6681a5', color: '#ffffff' }}
            >
              Beta Login
            </motion.a>
        </div>
        </>
        )}

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

      {/* ── Mobile sticky cluster chip bar ──────────────────────────── */}
      {activeCluster && PRODUCT_CLUSTERS[activeCluster]?.pages && (
        <div
          className="fixed left-0 right-0 z-40 md:hidden"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 70px)' }}
        >
          {/* Category label */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-white/90 backdrop-blur-md border-b border-slate-100">
            <Link
              to={PRODUCT_CLUSTERS[activeCluster].overview}
              className={`text-xs font-semibold uppercase tracking-wider ${
                location.pathname === PRODUCT_CLUSTERS[activeCluster].overview
                  ? 'text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              {activeCluster}
            </Link>
            <button
              onClick={() => setActiveCluster(null)}
              className="p-1 text-slate-400"
            >
              <X size={14} />
            </button>
          </div>
          {/* Scrollable chip bar */}
          <div className="flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-md border-b border-slate-100 overflow-x-auto scrollbar-hide">
            {PRODUCT_CLUSTERS[activeCluster].pages.map((page) => {
              const isActive = location.pathname === page.href;
              return (
                <Link
                  key={page.href}
                  to={page.href}
                  className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                  }`}
                >
                  {page.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
                    onClick={() => {
                      setMobileExpanded(mobileExpanded === category.label ? null : category.label);
                      setMobileClusterExpanded(null);
                    }}
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
                          {category.label === 'Product' ? (
                            /* Product: show clusters with nested sub-pages */
                            Object.entries(PRODUCT_CLUSTERS).map(([clusterName, cluster]) => (
                              <div key={clusterName} className="mb-1">
                                {/* Cluster header — tappable to expand */}
                                <button
                                  onClick={() => setMobileClusterExpanded(mobileClusterExpanded === clusterName ? null : clusterName)}
                                  className="w-full flex items-center justify-between px-2 py-3 rounded-xl active:bg-slate-50 transition-colors"
                                >
                                  <span className="text-sm font-semibold text-slate-800">{clusterName}</span>
                                  <ChevronDown
                                    size={14}
                                    className={`text-slate-400 transition-transform duration-200 ${
                                      mobileClusterExpanded === clusterName ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                                {/* Sub-pages accordion */}
                                <AnimatePresence>
                                  {mobileClusterExpanded === clusterName && (
                                    <motion.div
                                      variants={mobileAccordion}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      className="overflow-hidden"
                                    >
                                      <div className="pl-4 pb-2">
                                        {/* Overview link */}
                                        <Link
                                          to={cluster.overview}
                                          onClick={() => setMobileMenuOpen(false)}
                                          className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            location.pathname === cluster.overview
                                              ? 'bg-slate-900 text-white'
                                              : 'text-slate-600 active:bg-slate-50'
                                          }`}
                                        >
                                          Overview
                                        </Link>
                                        {/* Sub-page links */}
                                        {cluster.pages.map((page) => (
                                          <Link
                                            key={page.href}
                                            to={page.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                              location.pathname === page.href
                                                ? 'bg-slate-900 text-white font-medium'
                                                : 'text-slate-600 active:bg-slate-50'
                                            }`}
                                          >
                                            {page.label}
                                          </Link>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))
                          ) : (
                            /* Other categories: flat list as before */
                            category.sections.map((section, si) => (
                              <div key={si} className="mb-2">
                                {section.title && (
                                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 px-2">
                                    {section.title}
                                  </p>
                                )}
                                {section.items.map((item) => (
                                  <Link
                                    key={item.label}
                                    to={item.href}
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
                                  </Link>
                                ))}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Mobile CTA */}
              <div className="mt-6 flex flex-col gap-3">
                <motion.button
                  onClick={() => {
                    handleGetEarlyAccess();
                    setMobileMenuOpen(false);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-full text-sm font-semibold bg-slate-900 text-white shadow-lg"
                >
                  {brand.ctaLabel}
                </motion.button>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 rounded-full text-sm font-medium text-center"
                  style={{ backgroundColor: '#6681a5', color: '#ffffff' }}
                >
                  Beta Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
