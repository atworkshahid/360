import React from 'react';

type MLOStatus = 'Draft' | 'Approved' | 'Under Review';

interface MLOStatusBadgeProps {
  status: MLOStatus;
}

export const MLOStatusBadge: React.FC<MLOStatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStyles()}`}>
      {status}
    </span>
  );
};
