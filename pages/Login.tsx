import { useEffect } from 'react';

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
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-serif italic font-medium text-xl pt-1">V</span>
        </div>
        <p className="text-slate-500 text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default Login;
