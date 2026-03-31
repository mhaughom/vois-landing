import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Image,
  FileText,
  Video,
  Music,
  Eye,
  FolderSync,
  Search,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const mediaItems = [
  {
    type: 'image' as const,
    color: 'bg-blue-100',
    icon: null,
    filename: 'product-photo-01.jpg',
    tag: 'Product \u00b7 Water heater',
    ai: 'AI: Tankless unit, stainless steel, residential',
  },
  {
    type: 'image' as const,
    color: 'bg-green-100',
    icon: null,
    filename: 'team-photo.jpg',
    tag: 'Team \u00b7 4 people detected',
    ai: 'AI: Office setting, branded uniforms',
  },
  {
    type: 'document' as const,
    color: '',
    icon: FileText,
    filename: 'invoice-march.pdf',
    tag: 'Document \u00b7 OCR extracted',
    ai: 'AI: Henderson Plumbing, $4,250, March 2026',
  },
  {
    type: 'video' as const,
    color: '',
    icon: Video,
    filename: 'job-walkthrough.mp4',
    tag: 'Video \u00b7 Transcribed',
    ai: 'AI: 3min walkthrough, bathroom renovation',
  },
  {
    type: 'audio' as const,
    color: '',
    icon: Music,
    filename: 'client-call.m4a',
    tag: 'Audio \u00b7 Transcribed',
    ai: 'AI: Sarah Henderson, permit discussion',
  },
  {
    type: 'image' as const,
    color: 'bg-amber-100',
    icon: null,
    filename: 'logo.svg',
    tag: 'Logo \u00b7 Brand asset',
    ai: 'AI: Primary logo, dark variant',
  },
] as const;

const benefits = [
  {
    icon: Eye,
    title: 'AI vision analysis',
    desc: 'GPT-4o-mini detects products, people, colors, and text in images. Documents get OCR. Video and audio get transcription.',
  },
  {
    icon: FolderSync,
    title: 'One library everywhere',
    desc: 'Same media picker used across Products, Social, Marketing, Websites, Presentations. No duplication.',
  },
  {
    icon: Search,
    title: 'Semantic search',
    desc: 'Text chunked into 512-dim embeddings. Find media by meaning, not just metadata.',
  },
] as const;

const techItems = [
  'GPT-4o-mini vision',
  'Sharp WebP thumbnails',
  '512-dim embeddings',
  'SHA-256 dedup',
  'Auto role inference',
] as const;

const iconColorMap = {
  document: 'bg-rose-50 text-rose-500',
  video: 'bg-violet-50 text-violet-500',
  audio: 'bg-teal-50 text-teal-500',
} as const;

const Files: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* --- Navigation --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-5 md:px-12 bg-white/80 backdrop-blur-xl border-b border-slate-100"
        style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <a href="/work">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={16} className="text-slate-600" />
            <span className="font-medium text-sm text-slate-600">Back to Work</span>
          </motion.div>
        </a>

        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              <img src="/Logo/habos-icon.svg" alt="HABOS" className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">HABOS</span>
            </motion.div>
          </a>
        </div>

        <div className="w-32" />
      </motion.nav>

      {/* --- Content --- */}
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* 1. Hero */}
          <motion.section {...fadeUp()} className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/10 text-slate-700 rounded-full text-sm font-medium mb-6">
              Media Library
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 mb-6 leading-[1.1]">
              Upload It.<br />AI Understands It.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              Drop images, video, documents, or audio. AI extracts products, people,
              text, and meaning &mdash; then makes it searchable by content, not just filename.
            </p>
          </motion.section>

          {/* 2. Mock media grid */}
          <motion.section {...fadeUp(0.1)} className="mb-20">
            <div className="bg-slate-50 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                  <div
                    key={item.filename}
                    className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm"
                  >
                    {/* Thumbnail / icon */}
                    {item.type === 'image' ? (
                      <div
                        className={`${item.color} rounded-lg h-20 mb-3 flex items-center justify-center`}
                      >
                        <Image size={24} className="text-slate-400/60" />
                      </div>
                    ) : (
                      <div
                        className={`rounded-lg h-20 mb-3 flex items-center justify-center ${
                          iconColorMap[item.type as keyof typeof iconColorMap]?.split(' ')[0] ?? 'bg-slate-50'
                        }`}
                      >
                        {item.icon && (
                          <item.icon
                            size={28}
                            className={
                              iconColorMap[item.type as keyof typeof iconColorMap]?.split(' ')[1] ?? 'text-slate-400'
                            }
                          />
                        )}
                      </div>
                    )}

                    {/* Filename */}
                    <p className="text-sm font-medium text-slate-900 truncate mb-1.5">
                      {item.filename}
                    </p>

                    {/* Tag */}
                    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-2">
                      {item.tag}
                    </span>

                    {/* AI line */}
                    <p className="text-xs text-slate-400 leading-snug">{item.ai}</p>
                  </div>
                ))}
              </div>

              {/* Annotation below grid */}
              <p className="text-sm text-slate-500 text-center max-w-2xl mx-auto mt-6 leading-relaxed">
                Search by meaning: &ldquo;sauna product photo&rdquo; or &ldquo;Henderson
                invoice&rdquo; &mdash; not just filename. One library shared by Products,
                Social, Marketing, Websites, and Presentations.
              </p>
            </div>
          </motion.section>

          {/* 3. Three benefit cards */}
          <motion.section {...fadeUp(0.2)} className="mb-20">
            <div className="grid md:grid-cols-3 gap-5">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                    <b.icon size={20} className="text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-3">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 4. Tech strip */}
          <motion.section {...fadeUp(0.3)} className="mb-20">
            <div className="bg-slate-950 rounded-2xl py-5 px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {techItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && <span className="text-slate-600">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* 5. Closing CTA */}
          <motion.section {...fadeUp(0.4)} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-slate-900 mb-5 leading-tight">
              Other file managers store files.<br />
              HABOS understands them.
            </h2>
            <a href="/#waitlist">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-full font-medium text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
              >
                Join Waitlist
                <ArrowRight size={18} />
              </motion.button>
            </a>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default Files;
