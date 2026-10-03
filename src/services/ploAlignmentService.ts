import { Course, CLO, PLO } from '../types';
import { FrameworkOutcome } from '../types';

export interface PLOMappingGap {
  cloId: string;
  cloCode: string;
  type: 'unmapped' | 'undermapped' | 'low-cognitive-match';
  description: string;
  recommendation: string;
}

export interface PLOMappingReport {
  overallAlignmentScore: number;
  unmappedCLOs: CLO[];
  mappedCLOs: { clo: CLO; mappedPLOs: { plo: PLO; level: string }[] }[];
  gaps: PLOMappingGap[];
}

/**
 * Service to automatically map CLOs to PLOs based on keywords
 * or suggest mappings based on framework outcomes.
 */
export const PLOAlignmentService = {
  // Simple keyword-based suggestion engine
  suggestMapping: (clo: CLO, availablePLOs: PLO[]): PLO[] => {
    const cloKeywords = clo.statement.toLowerCase().split(/\W+/);
    const suggestions: PLO[] = [];

    availablePLOs.forEach((plo) => {
      const ploKeywords = plo.description.toLowerCase().split(/\W+/);
      const matches = cloKeywords.filter((word) => ploKeywords.includes(word));
      if (matches.length >= 2) {
        suggestions.push(plo);
      }
    });

    return suggestions;
  },

  generateReport: (course: Course): PLOMappingReport => {
    const cloMap = course.clos || [];
    const plos = course.plos || [];
    const gaps: PLOMappingGap[] = [];
    const mappedCLOs: PLOMappingReport['mappedCLOs'] = [];
    const unmappedCLOs: CLO[] = [];

    cloMap.forEach((clo) => {
      if (!clo.mappedPLOs || clo.mappedPLOs.length === 0) {
        unmappedCLOs.push(clo);
        gaps.push({
          cloId: clo.id,
          cloCode: clo.code,
          type: 'unmapped',
          description: `${clo.code} is not mapped to any Program Learning Outcome.`,
          recommendation: 'Map this outcome to at least one PLO in the Course Creator step 5.',
        });
      } else {
        const mappedPLOs = clo.mappedPLOs.map((m) => ({
          plo: plos.find((p) => p.id === m.ploId)!,
          level: m.level,
        })).filter(item => item.plo);
        
        mappedCLOs.push({ clo, mappedPLOs });
      }
    });

    return {
      overallAlignmentScore: plos.length > 0 
        ? Math.round(((cloMap.length - unmappedCLOs.length) / cloMap.length) * 100) 
        : 0,
      unmappedCLOs,
      mappedCLOs,
      gaps,
    };
  },
};
