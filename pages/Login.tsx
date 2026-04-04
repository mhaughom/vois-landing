import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://app.tryvois.com';

/**
 * Login page — redirects to the web app's login.
 *
 * The marketing site and web app are on separate domains, so Supabase
 * sessions can't be shared via localStorage. Instead of duplicating auth
 * here, we send users straight to the web app where they'll sign in once
 * and land on the dashboard.
 */
export const Login = () => {
  const { t } = useTranslation('login');

  useEffect(() => {
    window.location.href = `${WEB_APP_URL}/login`;
  }, []);

  // Brief flash while redirecting
  return (
    <div
      className="fixed inset-0 min-h-screen flex items-center justify-center"
      style={{ zIndex: 9999, pointerEvents: 'all', isolation: 'isolate' }}
    >
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      <div className="relative text-center">
        <div className="mx-auto mb-4">
          <img src="/Logo/vois-logo.svg" alt={t('logoAlt')} className="h-12 w-12" />
        </div>
        <p className="text-slate-500 text-sm">{t('redirecting')}</p>
      </div>
    </div>
  );
};

export default Login;
