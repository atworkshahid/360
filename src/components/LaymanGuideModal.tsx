import React from 'react';
import { X, CheckCircle2, Sparkles, BookOpen, Target, Calendar, Award, ArrowRight, Lightbulb } from 'lucide-react';
import { LogoMark } from './Logo';

interface LaymanGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCreating?: () => void;
}

export const LaymanGuideModal: React.FC<LaymanGuideModalProps> = ({ isOpen, onClose, onStartCreating }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3.5">
            <LogoMark size={38} variant="light" />
            <div>
              <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>MENTISERA OBE360™ • Quick Start Guide</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                How to Build Your Course in 4 Easy Steps
              </h3>
            </div>
          </div>
          <p className="text-xs text-indigo-100 mt-2 max-w-lg leading-relaxed">
            You don't need any complex academic jargon to build an engaging, organized course syllabus. Just follow this simple path!
          </p>
        </div>

        {/* 4 Simple Steps */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Step 1 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Step 1</span>
                <h4 className="font-bold text-slate-900 text-sm">Course Basics</h4>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Give your course a clear title (e.g., <em>Intro to Web Design</em>), select the student level (Beginner or Intermediate), and write 2-3 sentences explaining who it's for.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Step 2</span>
                <h4 className="font-bold text-slate-900 text-sm">What Students Will Learn (Goals)</h4>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Write 3 to 5 real-world skills your students will be able to do by the end. Use our <strong>✨ AI Suggest</strong> button if you want instant ideas!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Step 3</span>
                <h4 className="font-bold text-slate-900 text-sm">Weekly Schedule</h4>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Outline what will be taught each week. Assign one main topic per week (like <em>Week 1: Fundamentals</em>, <em>Week 2: Hands-on Practice</em>).
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Step 4</span>
                <h4 className="font-bold text-slate-900 text-sm">Grading & Assignments</h4>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Decide how students earn their grade (e.g., Homework 30%, Midterm Quiz 30%, Final Project 40%). Our live meter ensures it totals 100%.
              </p>
            </div>
          </div>

          {/* Friendly Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <strong>Need formal university accreditation?</strong> You can switch to <strong>Pro Mode</strong> at any time to unlock Bloom's taxonomy codes, Washington Accord matrices, and deep audit reports.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Fast, clear, and beginner-friendly</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onStartCreating) onStartCreating();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
          >
            <span>Got It, Let's Start!</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
