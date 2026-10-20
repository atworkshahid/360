import React, { useState } from 'react';
import { ModularLearningOutcome } from '../../types/mlu';
import { Quiz } from '../../types/quiz';
import { generateMLOQuiz } from '../../services/mluGeneratorService';
import { Loader2, X, CheckCircle2 } from 'lucide-react';

interface QuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mlo: ModularLearningOutcome;
  onQuizGenerated: (quiz: Quiz) => void;
}

export const QuizGeneratorModal: React.FC<QuizGeneratorModalProps> = ({ isOpen, onClose, mlo }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  React.useEffect(() => {
    if (isOpen && !quiz) {
      setLoading(true);
      generateMLOQuiz(mlo).then((q) => {
        setQuiz(q);
        onQuizGenerated(q);
        setLoading(false);
      });
    }
  }, [isOpen, mlo, quiz, onQuizGenerated]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold">Self-Assessment: {mlo.code}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-10"><Loader2 className="animate-spin text-indigo-600" size={32}/> Generating quiz...</div>
          ) : quiz ? (
            <div className="space-y-6">
              {quiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2">
                  <p className="font-semibold">{qIdx + 1}. {q.question}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt, oIdx) => (
                      <button 
                        key={oIdx}
                        onClick={() => !showFeedback && setUserAnswers(prev => ({...prev, [qIdx]: oIdx}))}
                        className={`p-3 rounded-lg border text-left ${userAnswers[qIdx] === oIdx ? 'bg-indigo-50 border-indigo-300' : 'hover:bg-slate-50 border-slate-200'} ${showFeedback && oIdx === q.correctAnswer ? 'bg-emerald-50 border-emerald-300' : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {showFeedback && (
                    <div className="text-xs p-3 rounded-lg bg-indigo-50 border border-indigo-100 mt-2">
                        <span className="font-bold text-indigo-900 block mb-1">Pedagogical Rationale:</span>{q.feedback}
                    </div>
                  )}
                </div>
              ))}
              {!showFeedback && (
                <button onClick={() => setShowFeedback(true)} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold">Submit Assessment</button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
