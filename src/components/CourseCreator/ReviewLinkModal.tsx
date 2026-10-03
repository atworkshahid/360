import React, { useState } from 'react';
import { X, Copy, Check, Clock, Link, ShieldCheck, MessageSquare, ShieldAlert } from 'lucide-react';
import { ShareService, CreateShareOptions, SharedCourseRecord } from '../../services/shareService';
import { Course } from '../../types';

interface ReviewLinkModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewLinkModal: React.FC<ReviewLinkModalProps> = ({ course, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const options: CreateShareOptions = {
        permissionLevel: 'reviewer_only',
        allowReviewerComments: true,
        expiresInDays: 7, // Default to 1 week
      };
      const record = await ShareService.createShareLink(course, options);
      const url = ShareService.getShareUrl(record.shareId);
      setGeneratedLink(url);
    } catch (err) {
      console.error('Error generating share link:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Link className="w-5 h-5 text-indigo-600" />
            Generate Peer Review Link
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Create a secure, time-limited, read-only link for reviewers. They can directly add comments to CLOs and assessments to facilitate curriculum audit.
        </p>

        {!generatedLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3 text-xs text-indigo-800">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block mb-0.5">Reviewer Access Level</span>
                Reviewers have read-only access but can add collaborative comments. Link expires in 7 days.
              </div>
            </div>
            
            <button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Review Link'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-xs text-slate-700">
              <span className="truncate mr-2">{generatedLink}</span>
              <button onClick={copyToClipboard} className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Link is valid for 7 days. You can revoke it at any time from the Review dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
