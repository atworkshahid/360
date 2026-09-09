import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Mail,
  Phone,
  Calendar,
  Download,
  Search,
  Filter,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { InstitutionalLead, LeadStatus } from '../types/lead';
import { getSavedLeads, updateLeadStatus, exportLeadsToCSV } from '../services/leadService';

interface LeadManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewLeadModal?: () => void;
}

export const LeadManagementModal: React.FC<LeadManagementModalProps> = ({
  isOpen,
  onClose,
  onOpenNewLeadModal,
}) => {
  const [leads, setLeads] = useState<InstitutionalLead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<InstitutionalLead | null>(null);
  const [activeNotes, setActiveNotes] = useState('');
  const [statusUpdatedToast, setStatusUpdatedToast] = useState(false);

  const loadLeads = () => {
    const list = getSavedLeads();
    setLeads(list);
    if (list.length > 0 && !selectedLead) {
      setSelectedLead(list[0]);
      setActiveNotes(list[0].notes || '');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLeads();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.frameworkInterest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectLead = (lead: InstitutionalLead) => {
    setSelectedLead(lead);
    setActiveNotes(lead.notes || '');
  };

  const handleChangeStatus = (newStatus: LeadStatus) => {
    if (!selectedLead) return;
    updateLeadStatus(selectedLead.id, newStatus, activeNotes);
    setSelectedLead({ ...selectedLead, status: newStatus, notes: activeNotes });
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, status: newStatus, notes: activeNotes } : l))
    );
    setStatusUpdatedToast(true);
    setTimeout(() => setStatusUpdatedToast(false), 1200);
  };

  const handleSaveNotes = () => {
    if (!selectedLead) return;
    updateLeadStatus(selectedLead.id, selectedLead.status, activeNotes);
    setSelectedLead({ ...selectedLead, notes: activeNotes });
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: activeNotes } : l))
    );
    setStatusUpdatedToast(true);
    setTimeout(() => setStatusUpdatedToast(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 relative">
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-400/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold font-serif text-white tracking-tight">
                  Institutional Leads &amp; Sales Inquiries
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase">
                  {leads.length} Received
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track campus demo inquiries, prospective university clients, and accreditation pilot requests.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportLeadsToCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
              title="Export all leads to CSV format"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>

            {onOpenNewLeadModal && (
              <button
                onClick={onOpenNewLeadModal}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              >
                <span>+ Log Inquiry</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs flex-1 min-w-[240px]">
            <div className="relative w-full max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by contact, university, or framework..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            {(['all', 'new', 'contacted', 'demo_scheduled', 'proposal_sent'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Split Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Leads List */}
          <div className="w-full md:w-5/12 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100 bg-slate-50/40">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold">No inquiries match your filter</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try resetting search criteria</p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isSelected = selectedLead?.id === lead.id;
                return (
                  <button
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    className={`w-full text-left p-4 transition cursor-pointer flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-indigo-50/90 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {lead.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {lead.fullName}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                            lead.status === 'new'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : lead.status === 'demo_scheduled'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : lead.status === 'proposal_sent'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {lead.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-700 truncate">
                        {lead.institution}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {lead.role} • {lead.frameworkInterest.split('(')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        <span>{lead.facultyCountRange.split('(')[0]}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Lead Detail View */}
          <div className="w-full md:w-7/12 p-6 overflow-y-auto bg-white flex flex-col justify-between">
            {selectedLead ? (
              <div className="space-y-5 text-xs">
                {/* Status Update Banner */}
                {statusUpdatedToast && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lead record updated successfully.</span>
                  </div>
                )}

                {/* Primary Card */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">{selectedLead.id}</span>
                      <h4 className="text-base font-bold text-slate-900">{selectedLead.fullName}</h4>
                      <p className="text-xs text-indigo-700 font-semibold">{selectedLead.role}</p>
                    </div>

                    {/* Status Switcher */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-500 text-[11px]">Workflow:</span>
                      <select
                        value={selectedLead.status}
                        onChange={(e) => handleChangeStatus(e.target.value as LeadStatus)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="new">New Inquiry</option>
                        <option value="contacted">Contacted</option>
                        <option value="demo_scheduled">Demo Scheduled</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">University / Campus:</span>
                      <strong className="text-slate-800">{selectedLead.institution}</strong>
                      {selectedLead.department && (
                        <div className="text-slate-600 text-[11px]">{selectedLead.department}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Target Accord:</span>
                      <strong className="text-indigo-700">{selectedLead.frameworkInterest}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Direct Email:</span>
                      <a
                        href={`mailto:${selectedLead.email}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {selectedLead.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Phone / WhatsApp:</span>
                      {selectedLead.phone ? (
                        <a
                          href={`tel:${selectedLead.phone}`}
                          className="text-emerald-700 hover:underline font-mono font-bold"
                        >
                          {selectedLead.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Campus Scope:</span>
                      <span className="text-slate-700 font-medium">{selectedLead.facultyCountRange}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Timeline for Adoption:</span>
                      <span className="text-slate-700 font-medium">{selectedLead.timeline}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Needs Pill List */}
                {selectedLead.primaryNeeds && selectedLead.primaryNeeds.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 text-xs">Identified Needs &amp; Objectives:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLead.primaryNeeds.map((need, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-medium"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements / Message */}
                {selectedLead.message && (
                  <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <label className="font-bold text-slate-700 text-xs block">Requirements from User:</label>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{selectedLead.message}"
                    </p>
                  </div>
                )}

                {/* Internal Sales Notes */}
                <div className="space-y-2 pt-1">
                  <label className="font-bold text-slate-700 text-xs flex items-center justify-between">
                    <span>Internal Follow-up Notes:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-saved to record</span>
                  </label>
                  <textarea
                    rows={3}
                    value={activeNotes}
                    onChange={(e) => setActiveNotes(e.target.value)}
                    placeholder="Log call notes, scheduled demo dates, or follow-up requirements..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                Select an inquiry from the list to review details.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-2.5 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>MENTISERA Higher Education CRM Ingestion Pipeline</span>
          </div>
          <div className="text-slate-400">
            Exported leads formatted for Salesforce, HubSpot, and Excel
          </div>
        </div>
      </div>
    </div>
  );
};
