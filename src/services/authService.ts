import { AppUser } from '../types';

export interface AuthUserState extends AppUser {
  institution?: string;
  avatarColor?: string;
  lastLoginAt?: string;
}

const AUTH_STORAGE_KEY = 'mentisera_obe360_auth_user_v1';

export const DEMO_USERS: AuthUserState[] = [
  {
    id: 'user-dean-sarah',
    name: 'Prof. Dr. Sarah Ahmed',
    email: 's.ahmed@nust.edu.pk',
    role: 'admin',
    title: 'Dean of Engineering & Program Chair',
    department: 'School of Electrical Engineering & Computer Science',
    institution: 'National University of Sciences & Technology',
    avatarColor: 'from-indigo-600 to-purple-600',
  },
  {
    id: 'user-prof-tariq',
    name: 'Dr. Tariq Mahmood',
    email: 'tariq.mahmood@fast.edu.pk',
    role: 'faculty',
    title: 'Associate Professor & Course Lead',
    department: 'Department of Computer Science',
    institution: 'National University of Computer & Emerging Sciences',
    avatarColor: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'user-reviewer-elena',
    name: 'Dr. Elena Vance',
    email: 'elena.vance@abet-review.org',
    role: 'reviewer',
    title: 'Senior Accreditation Evaluator (IQAC / QEC)',
    department: 'Directorate of Quality Assurance',
    institution: 'Higher Education Quality & Accreditation Council',
    avatarColor: 'from-amber-600 to-orange-600',
  },
  {
    id: 'user-designer-bilal',
    name: 'Engr. Bilal Khan',
    email: 'bilal.khan@mentisera.org',
    role: 'faculty',
    title: 'Senior Instructional Designer & OBE Specialist',
    department: 'Center for Excellence in Learning & Teaching',
    institution: 'University College of Engineering & Technology',
    avatarColor: 'from-blue-600 to-cyan-600',
  },
];

/**
 * Retrieves the currently authenticated user from localStorage.
 * Defaults to Prof. Dr. Sarah Ahmed for immediate demo convenience.
 */
export function getStoredAuthUser(): AuthUserState | null {
  if (typeof window === 'undefined') return DEMO_USERS[0];
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse auth user from localStorage:', err);
  }
  return DEMO_USERS[0];
}

/**
 * Stores authenticated user in localStorage.
 */
export function setStoredAuthUser(user: AuthUserState | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: { user } }));
  } catch (err) {
    console.warn('Failed to set auth user in localStorage:', err);
  }
}

/**
 * Logs in with a selected demo persona.
 */
export function signInWithPersona(personaId: string): AuthUserState {
  const found = DEMO_USERS.find((u) => u.id === personaId) || DEMO_USERS[0];
  const updated = { ...found, lastLoginAt: new Date().toISOString() };
  setStoredAuthUser(updated);
  return updated;
}

/**
 * Logs in with custom institutional email credentials.
 */
export function signInWithCredentials(
  email: string,
  fullName: string,
  institution: string,
  role: 'admin' | 'faculty' | 'reviewer' = 'faculty'
): AuthUserState {
  const newUser: AuthUserState = {
    id: `user-${Date.now()}`,
    name: fullName.trim() || email.split('@')[0],
    email: email.trim().toLowerCase(),
    role,
    title: role === 'admin' ? 'Department Chair / Dean' : role === 'reviewer' ? 'Accreditation Reviewer' : 'Faculty Member / Instructor',
    department: 'Faculty of Sciences & Engineering',
    institution: institution.trim() || 'Academic Institution',
    avatarColor: 'from-indigo-600 to-blue-600',
    lastLoginAt: new Date().toISOString(),
  };
  setStoredAuthUser(newUser);
  return newUser;
}

/**
 * Signs out the current user.
 */
export function signOutUser(): void {
  setStoredAuthUser(null);
}
