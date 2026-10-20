import React from 'react';
import { X, AlertTriangle, Clock } from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface SyncConflict {
  id: string;
  courseId: string;
  serverVersion: any;
  localVersion: any;
}

interface SyncLogEntry {
  timestamp: string;
  action: string;
  summary: string;
}

interface SyncConflictResolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: SyncConflict;
  onResolve: (resolvedData: any) => void;
  syncHistory?: SyncLogEntry[];
}

const SyncHistoryLog: React.FC<{ history: SyncLogEntry[] }> = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <h3 className="font-semibold mb-3 flex items-center">
        <Clock className="w-4 h-4 mr-2" /> Sync History
      </h3>
      <div className="space-y-2">
        {history.map((entry, index) => (
          <div key={index} className="text-xs bg-slate-50 p-2 rounded">
            <div className="flex justify-between font-medium text-slate-700">
              <span>{entry.action}</span>
              <span className="text-slate-500">{entry.timestamp}</span>
            </div>
            <p className="text-slate-600 mt-1">{entry.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SyncConflictResolverModal: React.FC<SyncConflictResolverModalProps> = ({
  isOpen,
  onClose,
  conflict,
  onResolve,
  syncHistory = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold text-lg">Sync Conflict Detected</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto space-y-4">
          <p className="text-sm text-slate-600">
            A version conflict occurred for your course. Please choose which version to keep.
          </p>
          
          <div className="border border-slate-200 rounded-xl p-3">
            <h3 className="font-semibold mb-2">Version Comparison</h3>
            <div className="h-96 overflow-auto">
              <ReactDiffViewer
                oldValue={JSON.stringify(conflict.serverVersion, null, 2)}
                newValue={JSON.stringify(conflict.localVersion, null, 2)}
                splitView={true}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button 
                onClick={() => onResolve(conflict.serverVersion)}
                className="py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Keep Server Version
              </button>
              <button 
                onClick={() => onResolve(conflict.localVersion)}
                className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Keep Local Version
              </button>
            </div>
            
            <div className="mt-4 border-t border-slate-200 pt-4">
              <h4 className="font-semibold text-sm mb-2">Batch Sync Manager</h4>
              <p className="text-xs text-slate-500 mb-3">Select MLOs to bulk resolve.</p>
              <div className="space-y-1 mb-3">
                {conflict.localVersion.mlos.map((mlo: any) => (
                  <label key={mlo.id} className="flex items-center text-xs text-slate-700">
                    <input type="checkbox" className="mr-2" />
                    {mlo.title}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-semibold">Keep Mine</button>
                <button className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-semibold">Keep Theirs</button>
              </div>
            </div>

            {conflict.serverVersion.updatedAt && conflict.localVersion.updatedAt && (
              <button
                onClick={() => {
                  const serverDate = new Date(conflict.serverVersion.updatedAt);
                  const localDate = new Date(conflict.localVersion.updatedAt);
                  onResolve(serverDate > localDate ? conflict.serverVersion : conflict.localVersion);
                }}
                className="mt-2 w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center justify-center gap-2"
              >
                <Clock className="w-3.5 h-3.5" />
                Auto-Merge (Use Newer Version)
              </button>
            )}

            <button
              onClick={() => onResolve(conflict.serverVersion)}
              className="mt-2 w-full py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold border border-red-200"
            >
              Discard Local Changes
            </button>
          </div>
          
          <SyncHistoryLog history={syncHistory} />
        </div>
      </div>
    </div>
  );
};
