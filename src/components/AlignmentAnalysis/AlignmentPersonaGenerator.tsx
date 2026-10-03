import React, { useState } from 'react';
import { User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Course, StudentPersona } from '../../types';
import { PersonaSimulationService } from '../../services/personaSimulationService';

interface AlignmentPersonaGeneratorProps {
  course: Course;
}

export const AlignmentPersonaGenerator: React.FC<AlignmentPersonaGeneratorProps> = ({ course }) => {
  const [personas, setPersonas] = useState<StudentPersona[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const results = await PersonaSimulationService.generatePersonas(course, 3);
      setPersonas(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          Alignment Persona Generator
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 transition"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Simulating...' : 'Generate Synthetic Profiles'}
        </button>
      </div>

      {personas.length === 0 && !loading && (
        <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-xs text-slate-500">Generate synthetic student profiles to simulate performance and identify potential learning friction points.</p>
        </div>
      )}

      {personas.map(persona => (
        <div key={persona.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">{persona.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">{persona.learningStyle}</span>
          </div>
          <p className="text-xs text-slate-600">{persona.background}</p>
          <div className="text-[11px] font-semibold text-slate-900 mt-2">
            Friction Points:
          </div>
          <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1">
            {persona.frictionPoints.map((fp, i) => (
              <li key={i} className="flex items-center gap-1">
                <AlertCircle className={`w-3 h-3 ${fp.severity === 'high' ? 'text-rose-500' : 'text-amber-500'}`} />
                {fp.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
