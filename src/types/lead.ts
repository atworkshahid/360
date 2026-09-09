export type LeadStatus = 'new' | 'contacted' | 'demo_scheduled' | 'proposal_sent' | 'archived';

export interface InstitutionalLead {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone?: string;
  institution: string;
  department?: string;
  role: string;
  frameworkInterest: string;
  facultyCountRange: string;
  primaryNeeds: string[];
  timeline: string;
  message?: string;
  status: LeadStatus;
  source?: string;
  notes?: string;
}

export interface LeadSubmissionPayload {
  fullName: string;
  email: string;
  phone?: string;
  institution: string;
  department?: string;
  role: string;
  frameworkInterest: string;
  facultyCountRange?: string;
  primaryNeeds?: string[];
  timeline?: string;
  message?: string;
  source?: string;
}
