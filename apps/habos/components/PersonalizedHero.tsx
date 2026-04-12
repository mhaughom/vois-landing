import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { trackPersonalizedEvent, type PersonalizedProspect } from '../lib/personalized';

/**
 * Hero section used on /for/:slug (swaps the default WorkHero3D hero).
 * Visually mirrors the default hero: same Section padding, same two-column
 * layout, same typography, same button style. Only the content is different.
 *
 * Visual source precedence:
 *   hero_video_url → prospect's custom video (e.g. Kling output)
 *   hero_image_url → prospect's custom image
 *   (fallback)     → the default /videos/Intro-trimmed.mp4 so the page still
 *                    feels like HABOS when nothing prospect-specific exists.
 */
interface Props {
  prospect: PersonalizedProspect;
}

export default function PersonalizedHero({ prospect }: Props) {
  const slug = prospect.slug;

  const defaultEyebrow = `For ${prospect.company_name}`;
  const defaultHeadline = `Here's what HABOS looks like for ${prospect.company_name}.`;
  const defaultSubline =
    'A human-to-agent operating system that replaces the tools you juggle today.';

  const handleCtaClick = () => {
    trackPersonalizedEvent(slug, 'cta_click', { button: 'hero-primary' });
    if (prospect.hero_cta_url) {
      trackPersonalizedEvent(slug, 'calendly_open');
      window.open(prospect.hero_cta_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section
      className="min-h-screen pt-20 md:pt-44 pb-8 md:pb-28 px-6 md:px-12 flex flex-col relative"
      style={{ overflow: 'visible' }}
    >
      <div className="max-w-7xl mx-auto w-full relative z-10 my-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* LEFT: prospect-specific text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left lg:flex-shrink-0 relative z-10 w-full lg:max-w-[50%]"
          >
            {/* Eyebrow — sits where the "heroGlowLabel" normally sits */}
            <div className="mb-3 flex items-center justify-center lg:justify-start gap-2">
              {prospect.company_logo_url && (
                <img
                  src={prospect.company_logo_url}
                  alt={prospect.company_name}
                  className="h-5 w-auto object-contain"
                  loading="eager"
                />
              )}
              <p
                className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ color: '#2563eb' }}
              >
                {prospect.hero_eyebrow || defaultEyebrow}
              </p>
            </div>

            {/* Headline — mirrors default hero's clamp sizing */}
            <h1
              className="mb-3 md:mb-5 tracking-tight leading-[1.08] font-bold"
              style={{
                fontSize: 'clamp(1.5rem, min(5vw, 7vh), 4.5rem)',
                color: '#0f172a',
              }}
            >
              {prospect.hero_headline || defaultHeadline}
            </h1>

            {/* Subline — matches default subtitle styling */}
            <p className="text-base md:text-xl text-slate-600 mb-6 md:mb-10 leading-relaxed max-w-2xl mt-3 md:mt-5">
              {prospect.hero_subline || defaultSubline}
            </p>

            {/* CTA — matches primary waitlist button */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-3">
              <motion.button
                onClick={handleCtaClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 sm:px-8 sm:py-3.5 bg-slate-900 text-white rounded-full text-sm sm:text-base font-semibold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                {prospect.hero_cta_label}
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT: visual (video > image > default intro) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center justify-center relative flex-1 w-full"
          >
            <div
              className="relative"
              style={{
                width: 'min(340px, 38vh)',
                height: 'min(340px, 38vh)',
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-white border border-slate-200/60 shadow-2xl" />
              {prospect.hero_video_url ? (
                <video
                  src={prospect.hero_video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 rounded-2xl w-full h-full object-cover"
                />
              ) : prospect.hero_image_url ? (
                <img
                  src={prospect.hero_image_url}
                  alt={prospect.company_name}
                  className="absolute inset-0 rounded-2xl w-full h-full object-cover"
                />
              ) : (
                <video
                  src="/videos/Intro-trimmed.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 rounded-2xl w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
