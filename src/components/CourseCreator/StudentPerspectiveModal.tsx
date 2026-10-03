import React from 'react';
import { X, BookOpen, Target, Award, Calendar } from 'lucide-react';
import { Course } from '../../types';

interface StudentPerspectiveModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentPerspectiveModal: React.FC<StudentPerspectiveModalProps> = ({ course, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Student Perspective View</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Header */}
          <header className="bg-indigo-900 text-white p-8 rounded-xl">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-indigo-100 text-lg">{course.code} | {course.creditHours} Credits</p>
          </header>

          {/* Description */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Course Overview
            </h3>
            <p className="text-slate-600 leading-relaxed">{course.description || "No description provided."}</p>
          </section>

          {/* CLOs */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" /> Learning Outcomes
            </h3>
            <ul className="space-y-2">
              {(course.clos || []).map((clo, i) => (
                <li key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-bold text-blue-900">{clo.code}</span>: {clo.statement}
                </li>
              ))}
            </ul>
          </section>

          {/* Assessments */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Assessment Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(course.assessments || []).map((asmt, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900">{asmt.title}</h4>
                  <p className="text-sm text-slate-500">{asmt.type} ({asmt.weightage}%)</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
