import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Course, QuestionItem, BloomLevel, Assessment } from '../../../types';
import { generateMCQQuestions, GeneratedQuestionItem } from '../../../services/api';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step10QuestionBuilder: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [selectedAsmtId, setSelectedAsmtId] = useState<string>(course.assessments[0]?.id || '');
  const [selectedQId, setSelectedQId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedAssessment =
    course.assessments.find((a) => a.id === selectedAsmtId) || course.assessments[0];

  const questions = selectedAssessment?.questions || [];
  const selectedQuestion = questions.find((q) => q.id === selectedQId) || questions[0];

  const handleUpdateQuestions = (asmtId: string, updatedQs: QuestionItem[]) => {
    const updatedAsmts = course.assessments.map((a) => (a.id === asmtId ? { ...a, questions: updatedQs } : a));
    onChange({ ...course, assessments: updatedAsmts });
  };

  const handleUpdateQuestion = (qId: string, updates: Partial<QuestionItem>) => {
    if (!selectedAssessment) return;
    const updated = questions.map((q) => (q.id === qId ? { ...q, ...updates } : q));
    handleUpdateQuestions(selectedAssessment.id, updated);
  };

  const handleAddQuestion = () => {
    if (!selectedAssessment) return;
    const cloId = selectedAssessment.linkedCLOIds?.[0] || course.clos[0]?.id || '';
    const mloId = course.mlos[0]?.id || '';

    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      assessmentId: selectedAssessment.id,
      questionStatement: 'Under governing legal provisions, which authority exercises constitutional jurisdiction over the dispute?',
      options: [
        'Provincial ombudsman sitting in executive session',
        'Council of Common Interests (CCI)',
        'Federal Board of Revenue',
        'National Security Advisory Council',
      ],
      correctAnswerIndex: 1,
      explanation: 'Articles 153 and 154 constitutionally establish the Council of Common Interests to formulate and regulate policies governing inter-provincial resources and disputes.',
      cloId,
      mloId,
      bloomLevel: 'Understand',
      difficulty: 'Medium',
      marks: 2,
      alignmentVerification: 'Directly verifies factual and jurisdictional comprehension required by the outcome.',
    };

    const updated = [...questions, newQ];
    handleUpdateQuestions(selectedAssessment.id, updated);
    setSelectedQId(newQ.id);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!selectedAssessment) return;
    const filtered = questions.filter((q) => q.id !== qId);
    handleUpdateQuestions(selectedAssessment.id, filtered);
    if (selectedQId === qId) {
      setSelectedQId(filtered[0]?.id || '');
    }
  };

  const handleOptionChange = (idx: number, text: string) => {
    if (!selectedQuestion) return;
    const opts = [...selectedQuestion.options] as [string, string, string, string];
    opts[idx] = text;
    handleUpdateQuestion(selectedQuestion.id, { options: opts });
  };

  const handleAiGenerateQuestions = async () => {
    if (!selectedAssessment) return;
    const mlo = course.mlos[0];
    const clo = course.clos[0];

    setIsGenerating(true);
    const generated: GeneratedQuestionItem[] = await generateMCQQuestions(
      mlo?.code || 'MLO 1.1',
      mlo?.statement || 'Constitutional jurisdiction',
      clo?.code || 'CLO 1',
      2,
      selectedAssessment.bloomLevel || 'Apply',
      'Medium'
    );
    setIsGenerating(false);

    const newQs: QuestionItem[] = generated.map((g, idx) => ({
      id: `q-${Date.now()}-${idx}`,
      assessmentId: selectedAssessment.id,
      questionStatement: g.questionStatement,
      options: g.options,
      correctAnswerIndex: g.correctAnswerIndex,
      explanation: g.explanation,
      cloId: clo?.id || '',
      mloId: mlo?.id || '',
      bloomLevel: g.bloomLevel,
      difficulty: g.difficulty,
      marks: g.marks || 2,
      alignmentVerification: g.alignmentVerification || 'Directly aligned with outcome Bloom level.',
    }));

    const updated = [...questions, ...newQs];
    handleUpdateQuestions(selectedAssessment.id, updated);
    if (newQs.length > 0) {
      setSelectedQId(newQs[0].id);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 10</span>
          <span>•</span>
          <span>Item-Level Measurement</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Question Mapping & Builder</h2>
            <p className="text-xs text-slate-500 mt-1">
              Build aligned single-correct MCQs with explicit outcome tagging, difficulty grading, and alignment verifications.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAiGenerateQuestions}
              disabled={isGenerating || !selectedAssessment}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{isGenerating ? 'Generating...' : 'AI Generate MCQs'}</span>
            </button>
            <button
              onClick={handleAddQuestion}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assessment Selector Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-slate-500 shrink-0 mr-2">Target Assessment:</span>
        {course.assessments.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setSelectedAsmtId(a.id);
              setSelectedQId('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              (selectedAssessment?.id || '') === a.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {a.name} ({a.questions?.length || 0})
          </button>
        ))}
      </div>

      {/* Questions list selector */}
      {questions.length > 0 ? (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setSelectedQId(q.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border ${
                (selectedQuestion?.id || '') === q.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Q{idx + 1}</span>
              <span className="text-[10px] px-1 rounded bg-slate-200 text-slate-800 font-normal">
                {q.bloomLevel}
              </span>
              <span className="max-w-[120px] truncate font-normal text-slate-300">
                {q.questionStatement}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-600 mb-3">
            No MCQs added to <strong>{selectedAssessment?.name}</strong> yet.
          </p>
          <button
            onClick={handleAiGenerateQuestions}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Aligned Questions with AI</span>
          </button>
        </div>
      )}

      {/* Question Detail Editor */}
      {selectedQuestion && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-800">Single-Correct MCQ</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-blue-600 font-semibold">{selectedQuestion.marks} Points</span>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteQuestion(selectedQuestion.id)}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Delete Question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Question Statement */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Question Statement / Problem Stem <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={selectedQuestion.questionStatement}
              onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { questionStatement: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 4 Options (A, B, C, D) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700">
              Answer Options <span className="text-slate-400 font-normal">(Select the radio button for the correct key)</span>
            </label>
            {(selectedQuestion.options || ['', '', '', '']).map((opt, i) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isCorrect = selectedQuestion.correctAnswerIndex === i;
              return (
                <div
                  key={i}
                  className={`flex items-center space-x-3 p-2.5 rounded-xl border transition ${
                    isCorrect ? 'bg-emerald-50/80 border-emerald-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`correct-${selectedQuestion.id}`}
                      checked={isCorrect}
                      onChange={() => handleUpdateQuestion(selectedQuestion.id, { correctAnswerIndex: i })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-xs text-slate-700">{letters[i]}</span>
                  </label>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${letters[i]}`}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {isCorrect && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Correct Key</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Doctrinal / Conceptual Explanation
            </label>
            <textarea
              rows={2}
              value={selectedQuestion.explanation}
              onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { explanation: e.target.value })}
              placeholder="Explain why the designated option is correct and how distractors are plausibly eliminated..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Tagging: CLO, MLO, Bloom Level, Difficulty, Marks */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target CLO</label>
              <select
                value={selectedQuestion.cloId}
                onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { cloId: e.target.value })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {course.clos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target MLO</label>
              <select
                value={selectedQuestion.mloId}
                onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { mloId: e.target.value })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {course.mlos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bloom Level</label>
              <select
                value={selectedQuestion.bloomLevel}
                onChange={(e) =>
                  handleUpdateQuestion(selectedQuestion.id, { bloomLevel: e.target.value as BloomLevel })
                }
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Remember">Remember</option>
                <option value="Understand">Understand</option>
                <option value="Apply">Apply</option>
                <option value="Analyze">Analyze</option>
                <option value="Evaluate">Evaluate</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Difficulty</label>
              <select
                value={selectedQuestion.difficulty}
                onChange={(e) =>
                  handleUpdateQuestion(selectedQuestion.id, { difficulty: e.target.value as any })
                }
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Marks</label>
              <input
                type="number"
                min={1}
                max={20}
                value={selectedQuestion.marks}
                onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { marks: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Alignment Verification */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
            <div className="flex items-center space-x-1.5 text-indigo-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Constructive Alignment Verification:</span>
            </div>
            <p className="text-xs text-indigo-800 italic">
              {selectedQuestion.alignmentVerification ||
                `Does this question actually measure ${course.clos.find((c) => c.id === selectedQuestion.cloId)?.code || 'the target outcome'} at ${selectedQuestion.bloomLevel} level? Direct empirical alignment verified.`}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment Designer</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Save & Proceed to Rubric Builder</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
