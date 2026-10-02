import { Institution, AppUser, UserRole } from '../types';
import { INSTITUTION_LOGO_PRESETS } from '../utils/logoHelper';

export const DEFAULT_INSTITUTION: Institution = {
  id: 'inst-apex-01',
  name: 'Apex Institute of Science & Technology',
  logoUrl: INSTITUTION_LOGO_PRESETS[0].dataUrl,
  facultySchool: 'Faculty of Computing & Information Technology',
  department: 'Department of Computer Science & Software Engineering',
  country: 'Pakistan',
  academicCalendar: 'Semester',
  semesterSystem: 'Fall-Spring-Summer',
  defaultCourseDurationWeeks: 16,
  defaultLanguage: 'English',
  defaultMappingScale: 'numeric_1_3',
  defaultFrameworkId: 'fw-abet-cac',
  defaultBloomTaxonomyVersion: 'Revised Bloom (Anderson & Krathwohl, 2001)',
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-admin-1',
    name: 'Dr. Eleanor Vance',
    email: 'e.vance@apex.edu',
    role: 'admin',
    department: 'Quality Enhancement & Accreditation Directorate',
    title: 'Director Quality Assurance & Accreditation',
  },
  {
    id: 'user-faculty-1',
    name: 'Prof. Shahid Soomro',
    email: 'ShahidSoomro786@gmail.com',
    role: 'faculty',
    department: 'Computer Science',
    title: 'Senior Associate Professor & Curriculum Designer',
  },
  {
    id: 'user-reviewer-1',
    name: 'Dr. Margaret Hamilton',
    email: 'm.hamilton@apex.edu',
    role: 'reviewer',
    department: 'Curriculum & Academic Standards Committee',
    title: 'Chair, Board of Studies & Lead Peer Reviewer',
  },
];

const INSTITUTION_STORAGE_KEY = 'mentisera_obe360_institution_v1';
const CURRENT_USER_KEY = 'mentisera_obe360_active_user_role_v1';

export function getStoredInstitution(): Institution {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(INSTITUTION_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_INSTITUTION, ...JSON.parse(raw) };
      }
    }
  } catch (e) {
    console.warn('Failed to load institution settings from localStorage:', e);
  }
  return DEFAULT_INSTITUTION;
}

export function saveStoredInstitution(inst: Institution): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(INSTITUTION_STORAGE_KEY, JSON.stringify(inst));
    }
  } catch (e) {
    console.error('Failed to save institution settings to localStorage:', e);
  }
}

export function getStoredActiveUser(): AppUser {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const user = INITIAL_USERS.find((u) => u.id === raw || u.role === raw);
      if (user) return user;
    }
  } catch (e) {
    console.warn('Failed to load active user from localStorage:', e);
  }
  // Default to faculty role
  return INITIAL_USERS[1];
}

export function saveStoredActiveUser(user: AppUser): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
  } catch (e) {
    console.error('Failed to save active user:', e);
  }
}

export function getActiveUserRole(): UserRole {
  return getStoredActiveUser().role;
}

export function setActiveUserRole(role: UserRole): void {
  const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[1];
  saveStoredActiveUser(user);
}

const USERS_STORAGE_KEY = 'mentisera_obe360_users_roster_v1';

export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load users from localStorage:', e);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage:', e);
  }
}

/**
 * Server-synchronization API helpers
 */
export async function fetchServerInstitution(): Promise<Institution> {
  try {
    const res = await fetch('/api/institution');
    if (res.ok) {
      const data = await res.json();
      if (data.institution) {
        saveStoredInstitution(data.institution);
        return data.institution;
      }
    }
  } catch (err) {
    console.warn('Could not fetch institution from server, using local:', err);
  }
  return getStoredInstitution();
}

export async function updateServerInstitution(
  updates: Partial<Institution>,
  userRole?: UserRole
): Promise<Institution> {
  const current = getStoredInstitution();
  const merged = { ...current, ...updates };
  saveStoredInstitution(merged);

  try {
    const res = await fetch('/api/institution', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole || getActiveUserRole(),
      },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.institution) {
        saveStoredInstitution(data.institution);
        return data.institution;
      }
    }
  } catch (err) {
    console.warn('Failed to persist institution to server, saved locally:', err);
  }
  return merged;
}

export async function fetchServerUsers(): Promise<AppUser[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users)) {
        saveStoredUsers(data.users);
        return data.users;
      }
    }
  } catch (err) {
    console.warn('Could not fetch users from server, using local:', err);
  }
  return getStoredUsers();
}

export async function updateServerUserRole(userId: string, role: UserRole): Promise<AppUser | null> {
  // Update locally first
  const currentUsers = getStoredUsers();
  const idx = currentUsers.findIndex((u) => u.id === userId);
  let updatedUser: AppUser | null = null;
  if (idx !== -1) {
    currentUsers[idx] = { ...currentUsers[idx], role };
    saveStoredUsers(currentUsers);
    updatedUser = currentUsers[idx];
  }

  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        return data.user;
      }
    }
  } catch (err) {
    console.warn('Failed to update user on server:', err);
  }
  return updatedUser;
}
