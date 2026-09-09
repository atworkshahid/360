import { InstitutionalLead, LeadSubmissionPayload, LeadStatus } from '../types/lead';

const LEADS_STORAGE_KEY = 'mentisera_obe360_institutional_leads_v1';
export const LEAD_GATE_STORAGE_KEY = 'mentisera_obe360_lead_gate_unlocked_v1';

export interface LeadGateActionOptions {
  featureTitle?: string;
  featureDescription?: string;
  source?: string;
  framework?: string;
}

/**
 * Checks if the user has unlocked high-value downloads / exports by completing the lead gate.
 */
export function isLeadGateUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LEAD_GATE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks the feature gate as unlocked.
 */
export function setLeadGateUnlocked(unlocked = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEAD_GATE_STORAGE_KEY, unlocked ? 'true' : 'false');
    window.dispatchEvent(
      new CustomEvent('lead_gate_status_changed', { detail: { unlocked } })
    );
  } catch (err) {
    console.warn('Failed to set lead gate status:', err);
  }
}

/**
 * Resets the feature gate back to locked (useful for testing and demonstrating the gate).
 */
export function resetLeadGate(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LEAD_GATE_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent('lead_gate_status_changed', { detail: { unlocked: false } })
    );
  } catch (err) {
    console.warn('Failed to reset lead gate:', err);
  }
}

/**
 * Executes an action if the feature gate is unlocked.
 * If locked, dispatches the 'open_lead_gate' event with the pending action and options to display LeadGenerationModal as an overlay gate.
 */
export function triggerWithLeadGate(
  action: () => void | Promise<void>,
  options: LeadGateActionOptions = {}
): boolean {
  if (isLeadGateUnlocked()) {
    try {
      const res = action();
      if (res && typeof (res as any).catch === 'function') {
        (res as Promise<void>).catch((err) => console.error('Gated action error:', err));
      }
    } catch (err) {
      console.error('Error executing gated action:', err);
    }
    return true;
  }

  // Not unlocked yet: dispatch event to trigger the LeadGenerationModal as an overlay gate
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('open_lead_gate', {
        detail: {
          action,
          options,
        },
      })
    );
  }
  return false;
}

// Initial sample lead for sales demonstration
const INITIAL_DEMO_LEADS: InstitutionalLead[] = [
  {
    id: 'lead-demo-101',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    fullName: 'Prof. Dr. Mansoor Ali',
    email: 'm.ali@uet.edu.pk',
    phone: '+92 321 4567890',
    institution: 'University of Engineering & Technology (UET)',
    department: 'Faculty of Civil & Mechanical Engineering',
    role: 'Dean of Faculty / PEC Accreditation Convener',
    frameworkInterest: 'Washington Accord (IEA / PEC Level II)',
    facultyCountRange: '50-200 faculty',
    primaryNeeds: [
      'Accreditation Visit Preparation',
      'CLO-PLO Matrix Standardization',
      'Continuous Quality Improvement (CQI)',
    ],
    timeline: 'Within 30 Days (Upcoming Accreditation Cycle)',
    message:
      'We are preparing for our Washington Accord reaccreditation visit next semester and urgently need to standardize outcome-based assessment blueprints and course dossiers across 4 engineering departments.',
    status: 'new',
    source: 'marketing_pricing_enterprise',
  },
  {
    id: 'lead-demo-102',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
    fullName: 'Dr. Rebecca Thorne',
    email: 'r.thorne@academics-west.edu',
    phone: '+1 (415) 890-2341',
    institution: 'California Institute of Technology & Computing',
    department: 'School of Information Technology',
    role: 'Director of Curriculum & Quality Assurance',
    frameworkInterest: 'ABET (CAC / EAC)',
    facultyCountRange: '10-50 faculty',
    primaryNeeds: [
      'ABET Accreditation Self-Study Dossiers',
      'Automated Rubrics & Direct Evidence',
      'Active Learning Engagement Metrics',
    ],
    timeline: 'Exploring for Next Academic Year',
    message:
      'Looking for a departmental license for 28 faculty members to build constructive alignment matrices and export LMS packages directly into Canvas.',
    status: 'demo_scheduled',
    source: 'marketing_hero',
    notes: 'Demo scheduled via Zoom with curriculum committee on Thursday at 2 PM EST.',
  },
];

/**
 * Retrieves all stored leads from localStorage and backend
 */
export function getSavedLeads(): InstitutionalLead[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_LEADS;
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse leads from localStorage:', err);
  }
  // Store initial demo leads if empty
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
  } catch {
    // ignore
  }
  return INITIAL_DEMO_LEADS;
}

/**
 * Persists leads array to localStorage
 */
function saveLeadsToStorage(leads: InstitutionalLead[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: { count: leads.length } }));
  } catch (err) {
    console.warn('Failed to save leads to localStorage:', err);
  }
}

/**
 * Submits a new institutional lead inquiry.
 * Saves locally immediately and posts to backend API asynchronously.
 */
export async function submitInstitutionalLead(payload: LeadSubmissionPayload): Promise<InstitutionalLead> {
  const newLead: InstitutionalLead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || undefined,
    institution: payload.institution.trim(),
    department: payload.department?.trim() || undefined,
    role: payload.role.trim(),
    frameworkInterest: payload.frameworkInterest || 'Washington Accord / ABET',
    facultyCountRange: payload.facultyCountRange || '10-50 faculty',
    primaryNeeds: payload.primaryNeeds || ['Accreditation Visit Preparation'],
    timeline: payload.timeline || 'Immediate',
    message: payload.message?.trim() || undefined,
    status: 'new',
    source: payload.source || 'web_form',
  };

  // 1. Save locally
  const currentLeads = getSavedLeads();
  const updatedLeads = [newLead, ...currentLeads];
  saveLeadsToStorage(updatedLeads);

  // 2. Post to backend API
  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    });
  } catch (err) {
    console.warn('Could not post lead to server endpoint, saved locally:', err);
  }

  return newLead;
}

/**
 * Updates lead status or notes (for the sales/admin team).
 */
export function updateLeadStatus(leadId: string, status: LeadStatus, notes?: string): void {
  const current = getSavedLeads();
  const updated = current.map((l) => (l.id === leadId ? { ...l, status, notes: notes ?? l.notes } : l));
  saveLeadsToStorage(updated);
}

/**
 * Exports all leads to a formatted CSV file for the institutional sales team.
 */
export function exportLeadsToCSV(): void {
  const leads = getSavedLeads();
  if (leads.length === 0) return;

  const headers = [
    'Lead ID',
    'Date Submitted',
    'Status',
    'Contact Name',
    'Email Address',
    'Phone',
    'Institution',
    'Department',
    'Role',
    'Framework of Interest',
    'Faculty Scale',
    'Timeline',
    'Primary Needs',
    'Message / Requirements',
    'Source',
  ];

  const escapeCSV = (val?: string | null) => {
    if (!val) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map((l) => [
    escapeCSV(l.id),
    escapeCSV(l.createdAt.split('T')[0]),
    escapeCSV(l.status),
    escapeCSV(l.fullName),
    escapeCSV(l.email),
    escapeCSV(l.phone || ''),
    escapeCSV(l.institution),
    escapeCSV(l.department || ''),
    escapeCSV(l.role),
    escapeCSV(l.frameworkInterest),
    escapeCSV(l.facultyCountRange),
    escapeCSV(l.timeline),
    escapeCSV((l.primaryNeeds || []).join('; ')),
    escapeCSV(l.message || ''),
    escapeCSV(l.source || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `MENTISERA_Institutional_Leads_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
