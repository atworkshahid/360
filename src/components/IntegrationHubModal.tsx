import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import {
  googleSignIn,
  logoutGoogleCalendar,
  getAccessToken,
  getCurrentGoogleUser,
  initAuth,
} from '../services/googleCalendarService';
import { User } from 'firebase/auth';

interface IntegrationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationHubModal: React.FC<IntegrationHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentGoogleUser());
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const checkToken = async () => {
      const token = await getAccessToken();
      setHasToken(!!token);
      setCurrentUser(getCurrentGoogleUser());
    };

    checkToken();

    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setHasToken(true);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await googleSignIn();
      setCurrentUser(getCurrentGoogleUser());
      setHasToken(true);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google Calendar.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogleCalendar();
    setCurrentUser(null);
    setHasToken(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Integration Hub</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!hasToken ? (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Connect Google Calendar</h3>
              <p className="text-xs text-slate-500">
                Connect your account to automatically schedule your assessment tasks.
              </p>
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {authError}
                </div>
              )}
              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign in with Google</span>}
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Calendar Connected</p>
                  <p className="text-[10px] text-emerald-700">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
