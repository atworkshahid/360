import { Institution, AppUser, UserRole } from '../types';

export const DEFAULT_INSTITUTION: Institution = {
  id: 'inst-apex-01',
  name: 'Apex Institute of Science & Technology',
  logoUrl: '',
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
    const raw = localStorage.getItem(INSTITUTION_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_INSTITUTION, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load institution settings from localStorage:', e);
  }
  return DEFAULT_INSTITUTION;
}

export function saveStoredInstitution(inst: Institution): void {
  try {
    localStorage.setItem(INSTITUTION_STORAGE_KEY, JSON.stringify(inst));
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
