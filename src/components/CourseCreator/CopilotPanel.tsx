import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  Scale,
  BookOpen,
  GraduationCap,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  RefreshCw,
  Cpu,
  Layers,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { Course } from '../../types';
import { sendChatMultiTurn, ChatHistoryMessage } from '../../services/api';

interface CopilotPanelProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export type ChatbotRole =
  | 'accreditation_specialist'
  | 'blooms_auditor'
  | 'assessment_architect'
  | 'curriculum_coach';

export type GeminiModelChoice =
  | 'gemini-3.5-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.8-flash';

interface RoleConfig {
  id: ChatbotRole;
  title: string;
  shortName: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  prompts: string[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'accreditation_specialist',
    title: 'Accreditation Specialist',
    shortName: 'Accreditation',
    badge: 'ABET / HEC / Accord',
    icon: GraduationCap,
    description: 'Constructive alignment, Washington Accord & ABET standards, evidence attainment thresholds.',
    prompts: [
      'Audit constructive alignment across PLO → CLO → MLO chain',
      'Validate evidence rules and minimum 60% attainment thresholds',
      'Review alignment matrix for accreditation compliance',
      'Check if capstone goal is supported by all course modules',
    ],
  },
  {
    id: 'blooms_auditor',
    title: "Bloom's Taxonomy Auditor",
    shortName: "Bloom's",
    badge: 'Cognitive Scaffolding',
    icon: Sparkles,
    description: 'Scrutinizes outcome verbs for measurability, cognitive rigor, and domain classification.',
    prompts: [
      'Audit all CLOs and replace passive verbs like "understand" or "know"',
      'Scaffold 4 MLOs in cognitive progression for Module 1',
      'Check Bloom level distribution for appropriate course level',
      'Refine outcome statements to follow action verb + context format',
    ],
  },
  {
    id: 'assessment_architect',
    title: 'Assessment & Rubric Architect',
    shortName: 'Assessment',
    badge: 'Blueprints & Rubrics',
    icon: Scale,
    description: 'Balances assessment plans, ensures 100% weight total, designs 5-tier analytic rubrics.',
    prompts: [
      'Audit assessment plan weights to confirm they total exactly 100%',
      'Design a 5-tier analytic rubric for the final capstone project',
      'Recommend authentic formative assessment tasks with direct evidence',
      'Draft diagnostic multiple-choice questions for Module 2',
    ],
  },
  {
    id: 'curriculum_coach',
    title: 'Curriculum Design Coach',
    shortName: 'Coaching',
    badge: 'Instructional Design',
    icon: BookOpen,
    description: 'Pacing, weekly credit hour distribution, active student learning, and CQI feedback loops.',
    prompts: [
      'Recommend active learning activities for complex technical lessons',
      'Structure weekly credit hours for blended delivery mode',
      'Formulate a Continuous Quality Improvement (CQI) action plan',
      'Design an interactive flipped classroom lesson sequence',
    ],
  },
];

const MODELS: Array<{ id: GeminiModelChoice; label: string; desc: string; badge: string }> = [
  {
    id: 'gemini-3.5-flash',
    label: 'gemini-3.5-flash',
    desc: 'General Tasks & Standard Reasoning',
    badge: 'Recommended',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'gemini-3.1-flash-lite',
    desc: 'Fast Iterations & Quick Prompts',
    badge: 'Fast',
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'gemini-3.1-pro-preview',
    desc: 'Complex Multi-Tier Curriculum Analysis',
    badge: 'Pro',
  },
  {
    id: 'gemini-3.8-flash',
    label: 'gemini-3.8-flash',
    desc: 'Pedagogical Guidance & Alignment',
    badge: 'Standard',
  },
];

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  course,
  isOpen,
  onClose,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>('accreditation_specialist');
  const [selectedModel, setSelectedModel] = useState<GeminiModelChoice>('gemini-3.5-flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirmClear, setIsConfirmClear] = useState<boolean>(false);

  // Multi-turn conversation messages
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I am your **OBE360™ Course Design Copilot** powered by Google Gemini.\n\nI am currently operating as the **Senior OBE Accreditation Specialist** for **"${course.title}"** (${course.code || 'NO-CODE'}).\n\nYou can switch my role anytime above (Bloom's Auditor, Assessment Architect, Curriculum Coach) or select different Gemini models. How can I help you refine your course today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active role config
  const currentRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];
  const RoleIcon = currentRoleConfig.icon;

  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      handleSend(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    const userMsg: ChatHistoryMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update messages with user query
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Course context payload
    const courseContext = {
      title: course.title,
      code: course.code,
      level: course.level,
      deliveryMode: course.deliveryMode,
      programme: course.category || course.programme,
      closCount: course.clos?.length || 0,
      clos: course.clos?.map((c) => ({ code: c.code, statement: c.statement, bloomLevel: c.bloomLevel })),
      modulesCount: course.modules?.length || 0,
      modules: course.modules?.map((m) => ({ number: m.number, title: m.title })),
      assessmentsCount: course.assessments?.length || 0,
      assessments: course.assessments?.map((a) => ({ title: a.title, type: a.type, weightage: a.weightage })),
      rubricsCount: course.rubrics?.length || 0,
    };

    // Filter messages for Gemini API payload (user and model turns)
    const historyPayload = updatedMessages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const res = await sendChatMultiTurn(historyPayload, selectedRole, selectedModel, courseContext);

      const assistantMsg: ChatHistoryMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatHistoryMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        text: `An error occurred while communicating with Gemini. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Conversation cleared. I am ready to assist you as your **${currentRoleConfig.title}** for **"${course.title}"**. What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsConfirmClear(false);
  };

  // Safe markdown-style simple renderer
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          // Headings ###
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-xs text-indigo-900 mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-sm text-slate-900 mt-2.5 mb-1 border-b border-slate-200 pb-0.5">
                {line.replace('## ', '')}
              </h3>
            );
          }
          // Bullet lines
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start space-x-1.5 ml-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{renderInlineBold(content)}</span>
              </div>
            );
          }
          // Numbered lines
          const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start space-x-1.5 ml-2">
                <span className="text-indigo-600 font-bold">{numMatch[1]}.</span>
                <span>{renderInlineBold(numMatch[2])}</span>
              </div>
            );
          }
          // Empty line spacing
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          // Default paragraph
          return <p key={idx}>{renderInlineBold(line)}</p>;
        })}
      </div>
    );
  };

  // Helper for **bold** text in markdown
  const renderInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[28rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col pt-14 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <RoleIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-bold text-slate-900">OBE360™ AI Copilot</h3>
              <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                Multi-Turn
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
              {course.code ? `[${course.code}] ` : ''}{course.title}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsConfirmClear(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
            title="Clear conversation history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation to Clear Conversation */}
      {isConfirmClear && (
        <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs flex items-center justify-between text-rose-800">
          <span>Clear full conversation thread?</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearHistory}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => setIsConfirmClear(false)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-semibold text-[10px] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Role & Model Controls Bar */}
      <div className="p-2.5 border-b border-slate-200 bg-white space-y-2 text-xs">
        {/* Role Selection */}
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Chatbot Role & System Persona
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-1.5 rounded-lg border text-left transition flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={role.description}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div className="truncate">
                    <span className="block text-[11px] truncate">{role.shortName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selection */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-slate-400" />
            <span>Gemini Model:</span>
          </span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as GeminiModelChoice)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-semibold rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.badge})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Inquiries for Active Role */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Suggested Prompts ({currentRoleConfig.shortName})
          </span>
        </div>
        <div className="space-y-1">
          {currentRoleConfig.prompts.slice(0, 2).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="w-full text-left p-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[11px] text-slate-700 font-medium hover:text-indigo-600 transition flex justify-between items-center group cursor-pointer shadow-2xs"
            >
              <span className="truncate pr-2">{prompt}</span>
              <span className="text-slate-400 group-hover:text-indigo-600 text-xs shrink-0">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-[#f8fafc]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold shadow-2xs">
                  <RoleIcon className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-xl p-3 shadow-xs relative group ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {!isUser ? (
                  renderFormattedText(msg.text)
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                )}

                <div
                  className={`text-[9px] mt-1.5 flex items-center justify-between pt-1 border-t ${
                    isUser
                      ? 'text-indigo-200 border-indigo-500/50'
                      : 'text-slate-400 border-slate-100'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="inline-flex items-center space-x-1 hover:text-slate-700 transition cursor-pointer text-[10px]"
                      title="Copy response"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-600 text-xs p-3 bg-white border border-slate-200 rounded-xl shadow-2xs animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">
                {currentRoleConfig.title} is analyzing...
              </p>
              <p className="text-[10px] text-slate-400">
                Evaluating alignment via {selectedModel}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask the ${currentRoleConfig.shortName} Specialist... (Press Enter to send)`}
            className="w-full pl-3 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 bottom-3.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
            title="Send inquiry"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 px-1">
          <span>Role: {currentRoleConfig.title}</span>
          <span>{selectedModel}</span>
        </div>
      </div>
    </aside>
  );
};
