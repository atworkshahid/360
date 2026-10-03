import React, { useState, useMemo } from 'react';
import { Course } from '../../types';
import { Search, Filter, AlertTriangle, CheckCircle2, Download } from 'lucide-react';

interface CompetencyMappingMatrixProps {
  courses: Course[];
}

export const CompetencyMappingMatrix: React.FC<CompetencyMappingMatrixProps> = ({ courses }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { matrix } = useMemo(() => {
    const comps = new Set<string>();
    const skills = new Set<string>();
    
    courses.forEach(c => {
      c.blueprint.targetCompetencies.forEach(x => comps.add(x));
      c.blueprint.requiredSkills.forEach(x => skills.add(x));
    });

    const masterList = [
      ...Array.from(comps).map(name => ({ name, type: 'Competency' as const })),
      ...Array.from(skills).map(name => ({ name, type: 'Skill' as const }))
    ];

    const matrix = masterList.map(item => {
      const coverage: Record<string, string> = {};
      courses.forEach(c => {
        const clo = c.clos?.find(clo => 
          (clo.competency === item.name) || (clo.skills?.split(',').map(s => s.trim()).includes(item.name))
        );
        coverage[c.id] = clo ? (clo.proficiencyLevel || 'Novice') : 'Gap';
      });
      return { ...item, coverage };
    });

    return { matrix };
  }, [courses]);

  const filteredData = useMemo(() => {
    return matrix.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [matrix, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Item', 'Type', ...courses.map(c => c.code)];
    const rows = filteredData.map(item => [
        item.name,
        item.type,
        ...courses.map(c => item.coverage[c.id])
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Competency_Mapping_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-slate-900">Competency & Skill Mapping Matrix</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>
[...skipped...]
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 font-bold text-slate-500">Item</th>
              <th className="p-3 font-bold text-slate-500">Type</th>
              {courses.map(c => <th key={c.id} className="p-3 font-bold text-slate-500 truncate max-w-[100px]" title={c.title}>{c.code}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map(item => (
              <tr key={item.name} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                <td className="p-3 text-slate-500">{item.type}</td>
                {courses.map(c => (
                  <td key={c.id} className="p-3 text-center text-[10px] font-bold">
                    <span className={item.coverage[c.id] === 'Gap' ? 'text-slate-300' : 'text-slate-800'}>
                        {item.coverage[c.id]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
