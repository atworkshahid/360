import React from 'react';
import { CourseVersion, CourseElementComment } from '../../types';
import { Clock, MessageSquare, Tag } from 'lucide-react';

interface ActivityFeedProps {
  versions: CourseVersion[];
  comments: CourseElementComment[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ versions, comments }) => {
  const allActivity = [
    ...versions.map(v => ({ type: 'version' as const, id: v.id, timestamp: v.timestamp, label: v.label, changes: v.changesSummary })),
    ...comments.map(c => ({ type: 'comment' as const, id: c.id, timestamp: c.createdAt, label: `${c.authorName} commented on ${c.targetTitle}`, tags: c.tags, content: c.content }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-white border-l border-slate-200 h-full overflow-y-auto w-80">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          Activity Feed
        </h3>
      </div>
      <div className="p-4 space-y-6">
        {allActivity.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No recent activity.</p>
        ) : (
          allActivity.map((activity) => (
            <div key={activity.id} className="relative pl-6 pb-2 border-l border-slate-200 last:border-0">
              <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-300" />
              <div className="text-[10px] text-slate-400 font-mono mb-1">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                {activity.type === 'comment' ? <MessageSquare className="w-3 h-3 text-slate-400" /> : <Clock className="w-3 h-3 text-slate-400" />}
                {activity.label}
              </div>
              
              {activity.type === 'comment' && activity.tags && activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {activity.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {activity.type === 'version' && (
                <ul className="text-[11px] text-slate-600 space-y-0.5">
                  {activity.changes?.map((change, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="mt-1 w-1 h-1 rounded-full bg-slate-400" />
                      {change}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
