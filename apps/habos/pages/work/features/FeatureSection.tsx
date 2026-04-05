import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

interface FeatureSectionProps {
  id?: string;
  index: number;
  badge: string;
  badgeIcon: React.ReactNode;
  badgeColor: string;
  headline: React.ReactNode;
  body: string;
  closingLine?: string;
  demo: React.ReactNode;
  link?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  id,
  index,
  badge,
  badgeIcon,
  badgeColor,
  headline,
  body,
  closingLine,
  demo,
  link,
}) => {
  const flipped = index % 2 === 1;
  const glass = index % 2 === 1;

  const content = (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
    >
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Text column */}
        <motion.div
          variants={fadeUp}
          className={flipped ? 'lg:order-2' : ''}
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div
              className="w-[52px] h-[52px] rounded-[15px] flex items-center justify-center flex-shrink-0 relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${badgeColor}25 0%, ${badgeColor}18 100%), linear-gradient(white, white)`,
                boxShadow: `0 2px 12px ${badgeColor}15, 0 1px 4px ${badgeColor}10`,
                border: `1.5px solid ${badgeColor}25`,
              }}
            >
              <span className="relative z-10 [&>svg]:!w-[24px] [&>svg]:!h-[24px]" style={{ color: badgeColor }}>
                {badgeIcon}
              </span>
            </div>
            <span
              className="text-[15px] font-bold uppercase tracking-wider"
              style={{ color: badgeColor }}
            >
              {badge}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-serif text-slate-900 mb-5 leading-[1.15]">
            {headline}
          </h2>

          <p className="text-lg text-slate-500 leading-relaxed mb-6">
            {body}
          </p>

          {closingLine && (
            <p className="text-sm text-slate-400 italic border-l-2 border-slate-200 pl-4 mb-6">
              {closingLine}
            </p>
          )}

          {link && (
            <a href={link}>
              <motion.span
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: badgeColor }}
              >
                Learn more
                <ArrowRight size={14} />
              </motion.span>
            </a>
          )}
        </motion.div>

        {/* Demo column */}
        <motion.div
          variants={scaleIn}
          className={flipped ? 'lg:order-1' : ''}
        >
          <div
            className="rounded-2xl md:rounded-3xl border overflow-hidden h-[360px] md:h-[400px]"
            style={{
              backgroundColor: glass ? 'white' : 'rgba(255,255,255,0.55)',
              backdropFilter: glass ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: glass ? 'none' : 'blur(20px)',
              borderColor: glass ? 'rgba(226,232,240,0.8)' : 'rgba(255,255,255,0.7)',
              boxShadow: '0 0 24px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04)',
            }}
          >
            {demo}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <section
      id={id}
      className="py-20 md:py-28 px-6 md:px-12"
    >
      {glass ? (
        <div className="max-w-7xl mx-auto bg-white/35 backdrop-blur-xl rounded-3xl md:rounded-[2rem] border border-white/60 p-8 md:p-12 lg:p-16" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.05), 0 12px 40px rgba(0,0,0,0.04)' }}>
          {content}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {content}
        </div>
      )}
    </section>
  );
};

export default FeatureSection;
