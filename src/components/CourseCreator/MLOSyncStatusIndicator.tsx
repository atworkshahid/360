import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

type SyncStatus = 'Synced' | 'Pending' | 'Conflict';

interface MLOSyncStatusIndicatorProps {
  status: SyncStatus;
  conflictDetails?: string;
}

export const MLOSyncStatusIndicator: React.FC<MLOSyncStatusIndicatorProps> = ({ status, conflictDetails }) => {
  const getStyles = () => {
    switch (status) {
      case 'Synced':
        return 'text-emerald-500';
      case 'Pending':
        return 'text-amber-500';
      case 'Conflict':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'Synced':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Conflict':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <div className={`group relative flex items-center space-x-1 ${getStyles()}`} title={`Status: ${status}`}>
      {getIcon()}
      <span className="text-[10px] font-semibold">{status}</span>
      {status === 'Conflict' && conflictDetails && (
        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-xs rounded shadow-lg w-48 z-10">
            {conflictDetails}
        </div>
      )}
    </div>
  );
};
