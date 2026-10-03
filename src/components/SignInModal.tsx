import React, { useState } from 'react';
import {
  X,
  LogIn,
  ShieldCheck,
  GraduationCap,
  Building,
  Key,
  Mail,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import {
  AuthUserState,
  DEMO_USERS,
  signInWithPersona,
  signInWithCredentials,
  signOutUser,
} from '../services/authService';
import { googleSignIn, logout } from '../services/firebaseAuth';
import { LogoMark, MentiseraLogo } from './Logo';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUserState | null;
  onUserChanged: (user: AuthUserState | null) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials' | 'sso'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'faculty' | 'reviewer'>('faculty');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectDemoPersona = (personaId: string) => {
    setValidationError(null);
    const user = signInWithPersona(personaId);
    onUserChanged(user);
    setLoginSuccessMessage(`Signed in as ${user.name} (${user.title})`);
    setTimeout(() => {
      setLoginSuccessMessage(null);
      onClose();
    }, 600);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please enter a valid institutional email address.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setValidationError('Password must be at least 4 characters.');
      return;
    }

    const user = signInWithCredentials(email, fullName, institution, selectedRole);
    onUserChanged(user);
    setLoginSuccessMessage(`Signed in as ${user.name}`);
    setTimeout(() => {
      setLoginSuccessMessage(null);
      onClose();
    }, 600);
  };

  const handleSSOLogin = (providerName: string) => {
    const ssoUser = signInWithCredentials(
      `faculty@${providerName.toLowerCase().replace(/\s+/g, '')}.edu`,
      'Faculty Member (SSO Verified)',
      `${providerName} Campus`,
      'faculty'
    );
    onUserChanged(ssoUser);
    setLoginSuccessMessage(`Authenticated via ${providerName} Single Sign-On`);
    setTimeout(() => {
      setLoginSuccessMessage(null);
      onClose();
    }, 600);
  };

  const handleSignOut = () => {
    signOutUser();
    onUserChanged(null);
    setLoginSuccessMessage('Signed out of session');
    setTimeout(() => {
      setLoginSuccessMessage(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 relative">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <LogoMark size={38} variant="light" />
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Academic Faculty &amp; Reviewer Authentication</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-white tracking-tight">
                Institutional Sign In
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Access outcome-based course dossiers, curriculum blueprints, and accreditation audit reports with your MENTISERA credentials.
          </p>
        </div>

        {/* Current Active User Status Ribbon */}
        {currentUser && (
          <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-tr ${
                  currentUser.avatarColor || 'from-indigo-600 to-purple-600'
                } text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser.title || currentUser.role} • {currentUser.institution || 'Institutional User'}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 border border-rose-200 transition cursor-pointer shrink-0 ml-3"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Success Toast */}
        {loginSuccessMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{loginSuccessMessage}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition cursor-pointer mr-5 ${
              activeTab === 'demo'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Institutional Personas (1-Click)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition cursor-pointer mr-5 ${
              activeTab === 'credentials'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email &amp; Password</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sso')}
            className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'sso'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus SSO</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {validationError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {validationError}
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Select an institutional role to instantly test evaluation, syllabus authoring, or accreditation auditing:
              </p>

              <div className="space-y-2">
                {DEMO_USERS.map((user) => {
                  const isCurrent = currentUser?.email === user.email;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectDemoPersona(user.id)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400'
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${user.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {user.name}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : user.role === 'reviewer'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">{user.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{user.institution}</div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isCurrent ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Institutional Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="f.name@university.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. John Doe"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus / University</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="State University"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                >
                  <option value="faculty">Faculty / Course Lead</option>
                  <option value="admin">Dean / Program Chair</option>
                  <option value="reviewer">Accreditation Auditor / External Examiner</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-200 transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In to OBE360</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'sso' && (
            <div className="space-y-3 text-xs">
              <p className="text-xs text-slate-500 mb-3">
                Seamless single sign-on integration configured for campus federations:
              </p>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await googleSignIn();
                    setLoginSuccessMessage('Successfully signed in with Google');
                    setTimeout(() => {
                      setLoginSuccessMessage(null);
                      onClose();
                    }, 600);
                  } catch (err) {
                    setValidationError('Failed to sign in with Google');
                  }
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-xs flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.3-4.74 3.3-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-800">Sign in with Google</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSSOLogin('Google Workspace for Education')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center">
                    G
                  </div>
                  <span className="font-semibold text-slate-800">Google Workspace for Education</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSSOLogin('Microsoft 365 Education')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                    MS
                  </div>
                  <span className="font-semibold text-slate-800">Microsoft 365 / Azure AD</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSSOLogin('InCommon / Shibboleth SAML')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    SAML
                  </div>
                  <span className="font-semibold text-slate-800">Campus SAML / EduGAIN Federation</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-medium text-slate-700">
            <LogoMark size={18} />
            <span>MENTISERA OBE360™ Enterprise IAM</span>
          </div>
          <span className="text-slate-400">FERPA &amp; Higher-Ed Compliant</span>
        </div>
      </div>
    </div>
  );
};
