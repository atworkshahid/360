import React from 'react';
import { MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CourseElementComment, CommentTargetType } from '../../../types';
import { getElementComments, getUnresolvedCommentsCount } from '../../../utils/commentUtils';

interface ElementCommentButtonProps {
  comments: CourseElementComment[] | undefined;
  targetId: string;
  targetType: CommentTargetType;
  targetTitle?: string;
  onClick: (targetId: string, targetType: CommentTargetType, targetTitle?: string) => void;
  variant?: 'compact' | 'standard' | 'pill';
  className?: string;
}

export const ElementCommentButton: React.FC<ElementCommentButtonProps> = ({
  comments,
  targetId,
  targetType,
  targetTitle,
  onClick,
  variant = 'standard',
  className = '',
}) => {
  const elementComments = getElementComments(comments, targetId);
  const totalCount = elementComments.length;
  const unresolvedCount = getUnresolvedCommentsCount(comments, targetId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(targetId, targetType, targetTitle);
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`relative p-1.5 rounded-lg border transition flex items-center justify-center cursor-pointer ${
          unresolvedCount > 0
            ? 'border-amber-300 bg-amber-50/80 text-amber-800 hover:bg-amber-100'
            : totalCount > 0
            ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
        } ${className}`}
        title={`${totalCount} comment(s) on ${targetTitle || targetType}${
          unresolvedCount > 0 ? ` (${unresolvedCount} unresolved)` : ''
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {totalCount > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none ${
              unresolvedCount > 0 ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-600 text-white'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
          unresolvedCount > 0
            ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            : totalCount > 0
            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
        } ${className}`}
        title="View or add stakeholder feedback on this element"
      >
        <MessageSquare className="w-3 h-3 text-slate-500" />
        <span>Feedback</span>
        {totalCount > 0 ? (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              unresolvedCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {totalCount}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-normal">+</span>
        )}
      </button>
    );
  }

  // Standard variant
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shadow-2xs ${
        unresolvedCount > 0
          ? 'bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100'
          : totalCount > 0
          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      } ${className}`}
      title={`Stakeholder discussion on ${targetTitle || targetType}`}
    >
      <MessageSquare className={`w-3.5 h-3.5 ${unresolvedCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
      <span>{totalCount > 0 ? `Comments (${totalCount})` : 'Add Feedback'}</span>
      {unresolvedCount > 0 && (
        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
          <AlertCircle className="w-2.5 h-2.5" />
          <span>{unresolvedCount}</span>
        </span>
      )}
    </button>
  );
};
