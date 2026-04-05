import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { t } = useTranslation('work-home');

  return (
    <footer className="py-16 px-6 md:px-16" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">

          {/* Col 1: Logo & Tagline */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/Logo/habos-icon.svg" alt={t('footer.logoAlt')} className="h-8 w-8" />
              <span className="font-semibold text-sm tracking-tight text-slate-900">{t('footer.brandName')}</span>
            </div>
            <p className="text-slate-500 text-sm">{t('footer.tagline')}</p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-slate-900 font-medium text-sm mb-4">{t('footer.product.heading')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.product.login')}</Link>
              </li>
              <li>
                <Link to="/" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.product.pricing')}</Link>
              </li>
              <li>
                <Link to="/" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.product.platform')}</Link>
              </li>
              <li>
                <Link to="/" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.product.habosPersonal')}</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-slate-900 font-medium text-sm mb-4">{t('footer.support.heading')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/support" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.support.helpFaq')}</Link>
              </li>
              <li>
                <a href="mailto:hello@habos.ai" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.support.contactSales')}</a>
              </li>
              <li>
                <Link to="/setup" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.support.setupGuide')}</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="text-slate-900 font-medium text-sm mb-4">{t('footer.legal.heading')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/Privacy" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.legal.privacyPolicy')}</Link>
              </li>
              <li>
                <Link to="/Terms" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.legal.termsOfService')}</Link>
              </li>
              <li>
                <Link to="/legal#refund" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.legal.refundPolicy')}</Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Social */}
          <div>
            <h4 className="text-slate-900 font-medium text-sm mb-4">{t('footer.social.heading')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://x.com/habos_ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.social.xTwitter')}</a>
              </li>
              <li>
                <a href="https://www.instagram.com/habos_ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.social.instagram')}</a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@habos_ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.social.tiktok')}</a>
              </li>
              <li>
                <a href="https://www.facebook.com/habos_ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">{t('footer.social.facebook')}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} HABOS AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
