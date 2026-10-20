import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  Edit3,
  Check,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  Layers,
  Award,
  Target,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Table,
  ShieldCheck,
  FileCode,
  Copy,
  ChevronDown,
  ChevronRight,
  Sliders,
  Eye,
  Settings2,
  Building2,
  Compass,
  CheckSquare,
  Square,
  Undo2,
  CheckCheck,
} from 'lucide-react';
import {
  Course,
  CLO,
  MLO,
  PLO,
  EMLO,
  BloomLevel,
  PLOMappingLevel,
  LearningDomain,
} from '../../types';
import { BLOOM_ORDER, BLOOM_RANK } from '../../utils/assessmentAnalysis';
import { DEFAULT_INSTITUTION, DEFAULT_INSTITUTIONAL_EMLOS } from '../../data/institutionData';

export interface UnifiedMLOCLOPLOMappingModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onChangeCourse?: (updatedCourse: Course) => void;
}

// Available Dimensions for the Universal Any-to-Any Custom Mapper
export type MappingDimension = 'emlo' | 'plo' | 'clo' | 'competency' | 'mlo';

export const DIMENSION_LABELS: Record<MappingDimension, { name: string; short: string; desc: string }> = {
  emlo: {
    name: 'Institutional Outcomes (I.EMLO)',
    short: 'I.EMLO',
    desc: 'Expected Educational Mission Learning Outcomes',
  },
  plo: {
    name: 'Program Learning Outcomes (PLO)',
    short: 'PLO',
    desc: 'Degree Graduate Attributes & Student Outcomes',
  },
  clo: {
    name: 'Course Learning Outcomes (CLO)',
    short: 'CLO',
    desc: 'Course-level competencies and demonstrable skills',
  },
  competency: {
    name: 'Target Competencies',
    short: 'Competency',
    desc: 'Disciplinary core competencies and skill domains',
  },
  mlo: {
    name: 'Modular Learning Outcomes (MLO)',
    short: 'MLO',
    desc: 'Instructional unit outcomes & weekly milestones',
  },
};

export const UnifiedMLOCLOPLOMappingModal: React.FC<UnifiedMLOCLOPLOMappingModalProps> = ({
  course,
  isOpen,
  onClose,
  onChangeCourse,
}) => {
  // Primary Tab: 'single_doc' vs 'custom_mapping'
  const [activeTab, setActiveTab] = useState<'single_doc' | 'custom_mapping'>('single_doc');

  // Sub-tab in Custom Mapping Studio
  const [mappingSubTab, setMappingSubTab] = useState<
    'universal' | 'emlo_plo' | 'clo_plo' | 'competencies' | 'mlo_clo' | 'emlo_manager'
  >('universal');

  // Universal Any-to-Any Mapper Configuration
  const [sourceDimension, setSourceDimension] = useState<MappingDimension>('emlo');
  const [targetDimension, setTargetDimension] = useState<MappingDimension>('plo');

  // Single Doc View Hierarchy Mode:
  // 'emlo_plo_clo_comp' = I.EMLO ➔ PLO ➔ CLO with Competencies (The Primary Standard)
  // 'clo_centric' = CLO ➔ PLO ➔ I.EMLO with Competencies
  // 'full_chain' = I.EMLO ➔ PLO ➔ CLO ➔ MLO ➔ Competencies & Evidence
  const [singleDocHierarchy, setSingleDocHierarchy] = useState<
    'emlo_plo_clo_comp' | 'clo_centric' | 'full_chain'
  >('emlo_plo_clo_comp');

  // Column Visibility Toggles in Single Doc View
  const [visibleCols, setVisibleCols] = useState({
    emlo: true,
    plo: true,
    clo: true,
    competencies: true,
    mappingLevel: true,
    bloom: true,
    weight: true,
    mlo: true,
    evidence: true,
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEMLOFilter, setSelectedEMLOFilter] = useState<string>('all');
  const [selectedPLOFilter, setSelectedPLOFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Custom Items Creation Modals
  const [showAddEMLOModal, setShowAddEMLOModal] = useState(false);
  const [showAddPLOModal, setShowAddPLOModal] = useState(false);
  const [showAddCLOModal, setShowAddCLOModal] = useState(false);
  const [showAddCompetencyModal, setShowAddCompetencyModal] = useState(false);
  const [showAddMLOModal, setShowAddMLOModal] = useState(false);

  // Form states for new entities
  const [newEMLO, setNewEMLO] = useState<{
    code: string;
    title: string;
    statement: string;
    bloomLevel: BloomLevel;
    targetDomain: LearningDomain;
  }>({
    code: `I.EMLO ${((course.emlos || DEFAULT_INSTITUTIONAL_EMLOS).length + 1)}`,
    title: '',
    statement: '',
    bloomLevel: 'Analyze',
    targetDomain: 'Cognitive',
  });

  const [newPLO, setNewPLO] = useState<{
    code: string;
    title: string;
    description: string;
  }>({
    code: `PLO ${((course.plos || []).length + 1)}`,
    title: '',
    description: '',
  });

  const [newCompetencyName, setNewCompetencyName] = useState('');

  const [newMLO, setNewMLO] = useState<{
    code: string;
    statement: string;
    bloomVerb: string;
    bloomLevel: BloomLevel;
    linkedCLOId: string;
    requiredActivity: string;
    assessment: string;
  }>({
    code: `MLO 1.${((course.mlos || []).length + 1)}.1`,
    statement: '',
    bloomVerb: 'Apply',
    bloomLevel: 'Apply',
    linkedCLOId: course.clos?.[0]?.id || '',
    requiredActivity: 'Guided Laboratory Exercise',
    assessment: 'Practical Problem Set',
  });

  // Safe entity resolution
  const emlos: EMLO[] = useMemo(() => {
    if (course.emlos && course.emlos.length > 0) {
      return course.emlos;
    }
    return DEFAULT_INSTITUTIONAL_EMLOS;
  }, [course.emlos]);

  const plos: PLO[] = useMemo(() => course.plos || [], [course.plos]);
  const clos: CLO[] = useMemo(() => course.clos || [], [course.clos]);
  const mlos: MLO[] = useMemo(() => course.mlos || [], [course.mlos]);

  const targetCompetencies: string[] = useMemo(() => {
    const set = new Set<string>();
    (course.blueprint?.targetCompetencies || []).forEach((c) => set.add(c));
    clos.forEach((c) => {
      if (c.competency && c.competency.trim()) set.add(c.competency.trim());
    });
    // Fallback if none defined
    if (set.size === 0) {
      set.add('Software Engineering & Systems');
      set.add('Algorithmic Problem Solving');
      set.add('Scientific Inquiry & Critical Thinking');
    }
    return Array.from(set);
  }, [course.blueprint?.targetCompetencies, clos]);

  const institutionName = course.institutionName || DEFAULT_INSTITUTION.name;
  const departmentName = course.department || DEFAULT_INSTITUTION.department;

  // Custom mapping stores
  const emloPloMap: Record<string, Record<string, string | number>> = useMemo(
    () => course.emloPloMapping || {},
    [course.emloPloMapping]
  );

  const customAnyMap: Record<string, Record<string, string | number>> = useMemo(
    () => course.customAnyMappings || {},
    [course.customAnyMappings]
  );

  // Helper to commit updates back to course
  const commitCourseUpdates = (updates: Partial<Course>) => {
    if (onChangeCourse) {
      onChangeCourse({
        ...course,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // ==========================================
  // CUSTOM MAPPING HANDLERS
  // ==========================================

  // 1. Universal Any-to-Any Custom Cell Toggle
  const handleToggleUniversalCell = (sourceId: string, targetId: string) => {
    const key = `${sourceDimension}_to_${targetDimension}`;
    const currentDimMap = customAnyMap[key] || {};
    const currentVal = currentDimMap[`${sourceId}__${targetId}`];

    let nextVal: string | null = null;
    if (!currentVal) {
      nextVal = 'Introduced'; // [I]
    } else if (currentVal === 'Introduced') {
      nextVal = 'Reinforced'; // [R]
    } else if (currentVal === 'Reinforced') {
      nextVal = 'Mastered'; // [M]
    } else if (currentVal === 'Mastered') {
      nextVal = 'Direct'; // [D]
    } else {
      nextVal = null; // Unmap
    }

    const updatedDimMap = { ...currentDimMap };
    if (nextVal) {
      updatedDimMap[`${sourceId}__${targetId}`] = nextVal;
    } else {
      delete updatedDimMap[`${sourceId}__${targetId}`];
    }

    const updatedCustomMap = {
      ...customAnyMap,
      [key]: updatedDimMap,
    };

    // If source=CLO and target=PLO, synchronize with CLO.mappedPLOs
    if (sourceDimension === 'clo' && targetDimension === 'plo') {
      const updatedCLOs = clos.map((clo) => {
        if (clo.id !== sourceId) return clo;
        const currentMapped = clo.mappedPLOs || [];
        let newMapped = currentMapped.filter((m) => m.ploId !== targetId);
        if (nextVal && (nextVal === 'Introduced' || nextVal === 'Reinforced' || nextVal === 'Mastered')) {
          newMapped.push({ ploId: targetId, level: nextVal as PLOMappingLevel });
        }
        return { ...clo, mappedPLOs: newMapped };
      });
      commitCourseUpdates({ customAnyMappings: updatedCustomMap, clos: updatedCLOs });
      return;
    }

    // If source=EMLO and target=PLO, synchronize with emloPloMapping
    if (sourceDimension === 'emlo' && targetDimension === 'plo') {
      const updatedEmloPlo = { ...emloPloMap };
      if (!updatedEmloPlo[sourceId]) updatedEmloPlo[sourceId] = {};
      if (nextVal) {
        updatedEmloPlo[sourceId][targetId] = nextVal;
      } else {
        delete updatedEmloPlo[sourceId][targetId];
      }
      commitCourseUpdates({
        customAnyMappings: updatedCustomMap,
        emloPloMapping: updatedEmloPlo,
      });
      return;
    }

    commitCourseUpdates({ customAnyMappings: updatedCustomMap });
  };

  // 2. Cycle CLO ➔ PLO Mapping Level
  const handleCycleCLOPLOMapping = (cloId: string, ploId: string) => {
    const updatedCLOs = clos.map((clo) => {
      if (clo.id !== cloId) return clo;

      const currentMapped = clo.mappedPLOs || [];
      const existing = currentMapped.find((m) => m.ploId === ploId);

      let nextLevel: PLOMappingLevel | null = null;
      if (!existing) {
        nextLevel = 'Introduced';
      } else if (existing.level === 'Introduced') {
        nextLevel = 'Reinforced';
      } else if (existing.level === 'Reinforced') {
        nextLevel = 'Mastered';
      } else {
        nextLevel = null;
      }

      let newMapped: typeof currentMapped;
      if (nextLevel) {
        if (existing) {
          newMapped = currentMapped.map((m) =>
            m.ploId === ploId ? { ...m, level: nextLevel! } : m
          );
        } else {
          newMapped = [...currentMapped, { ploId, level: nextLevel }];
        }
      } else {
        newMapped = currentMapped.filter((m) => m.ploId !== ploId);
      }

      return { ...clo, mappedPLOs: newMapped };
    });

    commitCourseUpdates({ clos: updatedCLOs });
  };

  // 3. Cycle I.EMLO ➔ PLO Mapping
  const handleCycleEMLOPLOMapping = (emloId: string, ploId: string) => {
    const current = emloPloMap[emloId]?.[ploId];
    let nextVal: string | null = null;

    if (!current) {
      nextVal = 'Reinforced';
    } else if (current === 'Reinforced') {
      nextVal = 'Mastered';
    } else if (current === 'Mastered') {
      nextVal = 'Introduced';
    } else {
      nextVal = null;
    }

    const updated = { ...emloPloMap };
    if (!updated[emloId]) updated[emloId] = {};
    if (nextVal) {
      updated[emloId][ploId] = nextVal;
    } else {
      delete updated[emloId][ploId];
    }

    commitCourseUpdates({ emloPloMapping: updated });
  };

  // 4. Toggle CLO Competency
  const handleToggleCLOCompetency = (cloId: string, compName: string) => {
    const updatedCLOs = clos.map((clo) => {
      if (clo.id !== cloId) return clo;
      return {
        ...clo,
        competency: clo.competency === compName ? '' : compName,
      };
    });
    commitCourseUpdates({ clos: updatedCLOs });
  };

  // 5. Update MLO Parent CLO
  const handleUpdateMLOParentCLO = (mloId: string, targetCLOId: string) => {
    const updatedMLOs = mlos.map((m) =>
      m.id === mloId ? { ...m, linkedCLOId: targetCLOId } : m
    );
    commitCourseUpdates({ mlos: updatedMLOs });
  };

  // 6. Add Custom I.EMLO
  const handleCreateCustomEMLO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEMLO.statement.trim() || !newEMLO.title.trim()) return;

    const created: EMLO = {
      id: `emlo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      code: newEMLO.code || `I.EMLO ${(emlos.length + 1)}`,
      title: newEMLO.title.trim(),
      statement: newEMLO.statement.trim(),
      bloomLevel: newEMLO.bloomLevel,
      targetDomain: newEMLO.targetDomain,
      weight: 25,
      mappedPLOIds: [],
    };

    commitCourseUpdates({ emlos: [...emlos, created] });
    setShowAddEMLOModal(false);
    setNewEMLO({
      code: `I.EMLO ${(emlos.length + 2)}`,
      title: '',
      statement: '',
      bloomLevel: 'Analyze',
      targetDomain: 'Cognitive',
    });
  };

  // 7. Delete Custom I.EMLO
  const handleDeleteEMLO = (emloId: string) => {
    if (emlos.length <= 1) {
      alert('At least one Institutional Educational Mission Learning Outcome must be maintained.');
      return;
    }
    const updated = emlos.filter((e) => e.id !== emloId);
    commitCourseUpdates({ emlos: updated });
  };

  // 8. Restore Default Institutional EMLOs
  const handleRestoreDefaultEMLOs = () => {
    if (confirm('Restore standard institutional Educational Mission Learning Outcomes (I.EMLO 1-4)?')) {
      commitCourseUpdates({ emlos: DEFAULT_INSTITUTIONAL_EMLOS });
    }
  };

  // 9. Add Custom PLO
  const handleCreateCustomPLO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPLO.title.trim()) return;

    const created: PLO = {
      id: `plo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      code: newPLO.code || `PLO ${(plos.length + 1)}`,
      title: newPLO.title.trim(),
      description: newPLO.description.trim() || newPLO.title.trim(),
    };

    commitCourseUpdates({ plos: [...plos, created] });
    setShowAddPLOModal(false);
    setNewPLO({
      code: `PLO ${(plos.length + 2)}`,
      title: '',
      description: '',
    });
  };

  // 10. Add Custom Competency
  const handleCreateCustomCompetency = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCompetencyName.trim();
    if (!name || targetCompetencies.includes(name)) return;

    const updatedBlueprint = {
      ...course.blueprint,
      targetCompetencies: [...(course.blueprint?.targetCompetencies || []), name],
    };

    commitCourseUpdates({ blueprint: updatedBlueprint });
    setNewCompetencyName('');
    setShowAddCompetencyModal(false);
  };

  // 11. Add Custom MLO
  const handleCreateCustomMLO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMLO.statement.trim()) return;

    const created: MLO = {
      id: `mlo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      code: newMLO.code || `MLO ${(mlos.length + 1)}.1`,
      moduleId: (course.modules || [])[0]?.id || 'module-1',
      linkedCLOId: newMLO.linkedCLOId || clos[0]?.id || '',
      statement: newMLO.statement.trim(),
      bloomVerb: newMLO.bloomVerb || 'Apply',
      bloomLevel: newMLO.bloomLevel || 'Apply',
      requiredActivity: newMLO.requiredActivity || 'Practical Lab',
      assessment: newMLO.assessment || 'Formative Milestone',
      evidence: 'Student artifact passing rubric threshold ≥ 70%',
      studyTimeHours: 6,
    };

    commitCourseUpdates({ mlos: [...mlos, created] });
    setShowAddMLOModal(false);
    setNewMLO({
      code: `MLO ${(mlos.length + 2)}.1`,
      statement: '',
      bloomVerb: 'Apply',
      bloomLevel: 'Apply',
      linkedCLOId: clos[0]?.id || '',
      requiredActivity: 'Guided Laboratory Exercise',
      assessment: 'Practical Problem Set',
    });
  };

  // 12. Auto-Scaffold / Auto-Align across the entire chain
  const handleAutoAlignAll = () => {
    if (clos.length === 0) return;

    // 1. Auto-align I.EMLO ➔ PLO if unmapped
    const updatedEmloPlo: Record<string, Record<string, string | number>> = { ...emloPloMap };
    emlos.forEach((emlo, eIdx) => {
      if (!updatedEmloPlo[emlo.id] || Object.keys(updatedEmloPlo[emlo.id]).length === 0) {
        updatedEmloPlo[emlo.id] = {};
        // Associate with 2 sequential or matching PLOs
        if (plos.length > 0) {
          const p1 = plos[eIdx % plos.length];
          const p2 = plos[(eIdx + 1) % plos.length];
          updatedEmloPlo[emlo.id][p1.id] = 'Mastered';
          if (p2 && p2.id !== p1.id) {
            updatedEmloPlo[emlo.id][p2.id] = 'Reinforced';
          }
        }
      }
    });

    // 2. Ensure each CLO has PLO mappings
    const updatedCLOs = clos.map((c, idx) => {
      const current = c.mappedPLOs || [];
      if (current.length > 0 || plos.length === 0) return c;

      const p1 = plos[idx % plos.length];
      const p2 = plos[(idx + 1) % plos.length];
      const mapped: { ploId: string; level: PLOMappingLevel }[] = [
        { ploId: p1.id, level: 'Mastered' },
      ];
      if (p2 && p2.id !== p1.id) {
        mapped.push({ ploId: p2.id, level: 'Reinforced' });
      }
      return { ...c, mappedPLOs: mapped };
    });

    // 3. Ensure each MLO is mapped to a CLO
    const updatedMLOs = mlos.map((m, idx) => {
      if (m.linkedCLOId && clos.some((c) => c.id === m.linkedCLOId)) {
        return m;
      }
      const match =
        clos.find((c) => c.bloomLevel === m.bloomLevel) || clos[idx % clos.length];
      return { ...m, linkedCLOId: match.id };
    });

    commitCourseUpdates({
      emloPloMapping: updatedEmloPlo,
      clos: updatedCLOs,
      mlos: updatedMLOs,
    });
  };

  // ==========================================
  // RESOLVED ENTITY LISTS FOR UNIVERSAL MAPPER
  // ==========================================
  const getEntitiesForDimension = (dim: MappingDimension) => {
    switch (dim) {
      case 'emlo':
        return emlos.map((e) => ({
          id: e.id,
          code: e.code,
          label: e.title || e.code,
          detail: e.statement,
        }));
      case 'plo':
        return plos.map((p) => ({
          id: p.id,
          code: p.code,
          label: p.title || p.code,
          detail: p.description,
        }));
      case 'clo':
        return clos.map((c) => ({
          id: c.id,
          code: c.code,
          label: `${c.bloomLevel}: ${c.statement.substring(0, 40)}...`,
          detail: c.statement,
        }));
      case 'competency':
        return targetCompetencies.map((comp) => ({
          id: comp,
          code: comp,
          label: comp,
          detail: `Target Competency: ${comp}`,
        }));
      case 'mlo':
        return mlos.map((m) => ({
          id: m.id,
          code: m.code,
          label: m.statement.substring(0, 40) + '...',
          detail: m.statement,
        }));
      default:
        return [];
    }
  };

  const universalSourceEntities = useMemo(
    () => getEntitiesForDimension(sourceDimension),
    [sourceDimension, emlos, plos, clos, targetCompetencies, mlos]
  );

  const universalTargetEntities = useMemo(
    () => getEntitiesForDimension(targetDimension),
    [targetDimension, emlos, plos, clos, targetCompetencies, mlos]
  );

  // Helper to read active value in Universal Matrix
  const getUniversalCellValue = (sId: string, tId: string): string | null => {
    // 1. Direct customAnyMap check
    const key = `${sourceDimension}_to_${targetDimension}`;
    const customVal = customAnyMap[key]?.[`${sId}__${tId}`];
    if (customVal) return String(customVal);

    // 2. Inverted customAnyMap check
    const invKey = `${targetDimension}_to_${sourceDimension}`;
    const invVal = customAnyMap[invKey]?.[`${tId}__${sId}`];
    if (invVal) return String(invVal);

    // 3. Fallbacks to standard fields
    if (sourceDimension === 'clo' && targetDimension === 'plo') {
      const clo = clos.find((c) => c.id === sId);
      const m = clo?.mappedPLOs?.find((item) => item.ploId === tId);
      return m ? m.level : null;
    }
    if (sourceDimension === 'plo' && targetDimension === 'clo') {
      const clo = clos.find((c) => c.id === tId);
      const m = clo?.mappedPLOs?.find((item) => item.ploId === sId);
      return m ? m.level : null;
    }

    if (sourceDimension === 'emlo' && targetDimension === 'plo') {
      const emlo = emlos.find((e) => e.id === sId);
      const mapped = emloPloMap[sId]?.[tId] || (emlo?.mappedPLOIds?.includes(tId) ? 'Mastered' : null);
      return mapped ? String(mapped) : null;
    }

    if (sourceDimension === 'clo' && targetDimension === 'competency') {
      const clo = clos.find((c) => c.id === sId);
      return clo?.competency === tId ? 'Direct' : null;
    }

    if (sourceDimension === 'mlo' && targetDimension === 'clo') {
      const mlo = mlos.find((m) => m.id === sId);
      return mlo?.linkedCLOId === tId ? 'Direct' : null;
    }

    return null;
  };

  // ==========================================
  // SINGLE DOCUMENT EXPORT HANDLERS
  // ==========================================

  const handlePrintSingleDoc = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Institutional Outcome (I.EMLO)',
      'I.EMLO Statement',
      'Program Learning Outcome (PLO)',
      'PLO Title',
      'Course Outcome (CLO)',
      'CLO Statement',
      'Bloom Level',
      'CLO Weight (%)',
      'Alignment Level (I/R/M)',
      'Target Competencies',
      'Associated Skills',
      'Linked Modular Outcomes (MLOs)',
      'Assessment Evidence Method',
    ];

    const rows: string[][] = [];

    emlos.forEach((emlo) => {
      // Find mapped PLOs for this EMLO
      const mappedPloIds = Object.keys(emloPloMap[emlo.id] || {});
      const relevantPLOs = plos.filter(
        (p) => mappedPloIds.includes(p.id) || (emlo.mappedPLOIds || []).includes(p.id)
      );

      const ploList = relevantPLOs.length > 0 ? relevantPLOs : plos.slice(0, 2);

      ploList.forEach((plo) => {
        // Find CLOs mapped to this PLO
        const linkedCLOs = clos.filter((c) =>
          (c.mappedPLOs || []).some((m) => m.ploId === plo.id)
        );

        const cloList = linkedCLOs.length > 0 ? linkedCLOs : clos;

        cloList.forEach((clo) => {
          const mappedRecord = (clo.mappedPLOs || []).find((m) => m.ploId === plo.id);
          const levelStr = mappedRecord?.level || 'Reinforced';
          const childMLOs = mlos.filter((m) => m.linkedCLOId === clo.id);
          const mloCodes = childMLOs.map((m) => m.code).join('; ') || 'Standard Instructional Units';

          rows.push([
            `"${emlo.code}: ${emlo.title.replace(/"/g, '""')}"`,
            `"${emlo.statement.replace(/"/g, '""')}"`,
            `"${plo.code}"`,
            `"${plo.title.replace(/"/g, '""')}"`,
            `"${clo.code}"`,
            `"${clo.statement.replace(/"/g, '""')}"`,
            `"${clo.bloomLevel}"`,
            String(clo.weightage ?? 20),
            `"${levelStr}"`,
            `"${(clo.competency || 'Core Discipline').replace(/"/g, '""')}"`,
            `"${(clo.skills || '').replace(/"/g, '""')}"`,
            `"${mloCodes}"`,
            `"${(clo.assessmentMethod || 'Authentic Rubric Assessment').replace(/"/g, '""')}"`,
          ]);
        });
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.code || 'OBE'}_Single_Doc_I_EMLO_CLO_PLO_Competencies_Alignment.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    let md = `# SINGLE DOCUMENT: I.EMLO ➔ PLO ➔ CLO WITH COMPETENCIES ALIGNMENT\n`;
    md += `**Institution:** ${institutionName}  \n`;
    md += `**Department:** ${departmentName}  \n`;
    md += `**Course:** ${course.code} - ${course.title}  \n`;
    md += `**Accreditation Framework:** ${course.accreditationFramework || 'Outcome-Based Education (OBE)'}  \n`;
    md += `**Date:** ${new Date().toLocaleDateString()}  \n\n`;
    md += `## 1. Constructive Alignment Hierarchy\n\n`;
    md += `| Institutional Outcome (I.EMLO) | Program Outcome (PLO) | Course Outcome (CLO) | Bloom Level | Alignment | Target Competencies |\n`;
    md += `| ------------------------------ | --------------------- | -------------------- | ----------- | --------- | ------------------- |\n`;

    emlos.forEach((emlo) => {
      const mappedPloIds = Object.keys(emloPloMap[emlo.id] || {});
      const relevantPLOs = plos.filter(
        (p) => mappedPloIds.includes(p.id) || (emlo.mappedPLOIds || []).includes(p.id)
      );
      const ploList = relevantPLOs.length > 0 ? relevantPLOs : plos.slice(0, 1);

      ploList.forEach((plo) => {
        const linkedCLOs = clos.filter((c) =>
          (c.mappedPLOs || []).some((m) => m.ploId === plo.id)
        );
        const cloList = linkedCLOs.length > 0 ? linkedCLOs : clos.slice(0, 2);

        cloList.forEach((clo) => {
          const m = (clo.mappedPLOs || []).find((x) => x.ploId === plo.id);
          const lvl = m?.level ? m.level[0] : 'R';
          md += `| **${emlo.code}** | **${plo.code}** | **${clo.code}**: ${clo.statement.substring(0, 30)}... | ${clo.bloomLevel} | [${lvl}] | ${clo.competency || 'Core'} |\n`;
        });
      });
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* ========================================================= */}
        {/* MODAL TOP BAR: ACCREDITATION BRAND & MODE CONTROLS        */}
        {/* ========================================================= */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b border-indigo-900/40">
          <div className="flex items-center space-x-3.5">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shadow-inner">
              <Table className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Single Doc &amp; Custom Mapping Studio
                </span>
                <span className="text-xs text-indigo-300 font-bold">{course.code}</span>
                <span className="text-xs text-slate-400">• {course.title}</span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5 flex items-center space-x-2">
                <span>Single Doc I.EMLO ➔ PLO ➔ CLO with Competencies Alignment</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            {/* Primary Tab Switcher: Single Doc View vs Custom Mapping Studio */}
            <div className="flex items-center p-1 bg-white/10 rounded-2xl border border-white/15 text-xs font-bold shadow-inner">
              <button
                type="button"
                id="unified-tab-single-doc"
                onClick={() => setActiveTab('single_doc')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'single_doc'
                    ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="View unified, publication-ready Single Document with I.EMLO-CLO-PLO & Competencies"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Single Doc Aligned</span>
              </button>

              <button
                type="button"
                id="unified-tab-custom-mapping"
                onClick={() => setActiveTab('custom_mapping')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'custom_mapping'
                    ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Customize any mapping between I.EMLO, PLO, CLO, Competencies, and MLOs"
              >
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Interactive Custom Mapping</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN SCROLLABLE WORKSPACE                                */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 space-y-6">
          {activeTab === 'single_doc' ? (
            /* ======================================================= */
            /* VIEW 1: SINGLE DOC I.EMLO-CLO-PLO ALIGNED SPECIFICATION */
            /* ======================================================= */
            <div className="space-y-4">
              {/* Document Customization Toolbar */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                {/* Left: Chain Status & Hierarchy Mode Selector */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">
                      Aligned Chain: <strong>{emlos.length} I.EMLOs</strong> ➔{' '}
                      <strong>{plos.length} PLOs</strong> ➔ <strong>{clos.length} CLOs</strong> ➔{' '}
                      <strong>{targetCompetencies.length} Competencies</strong>{' '}
                      {mlos.length > 0 && <span>(supporting {mlos.length} MLOs)</span>}
                    </span>
                  </div>

                  {/* Hierarchy Mode Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Layout Hierarchy:
                    </span>
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                      <button
                        type="button"
                        onClick={() => setSingleDocHierarchy('emlo_plo_clo_comp')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          singleDocHierarchy === 'emlo_plo_clo_comp'
                            ? 'bg-white text-indigo-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        I.EMLO ➔ PLO ➔ CLO (Primary OBE)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleDocHierarchy('clo_centric')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          singleDocHierarchy === 'clo_centric'
                            ? 'bg-white text-indigo-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        CLO-Centric Alignment
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleDocHierarchy('full_chain')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          singleDocHierarchy === 'full_chain'
                            ? 'bg-white text-indigo-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Full Chain with MLO Units
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Print, CSV, Markdown, Auto-Align) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoAlignAll}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    title="Auto-align any unlinked I.EMLOs, PLOs, or CLOs using Bloom's Taxonomy cognitive levels"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Auto-Harmonize All</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied MD' : 'Copy MD'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    id="single-doc-print-btn"
                    onClick={handlePrintSingleDoc}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    title="Print official single document specification (Ctrl+P / Command+P)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Single Doc</span>
                  </button>
                </div>
              </div>

              {/* Column Visibility Customizer Accordion */}
              <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-700 flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Visible Columns:</span>
                  </span>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.emlo}
                      onChange={(e) => setVisibleCols({ ...visibleCols, emlo: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>I.EMLO</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.plo}
                      onChange={(e) => setVisibleCols({ ...visibleCols, plo: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>PLO</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.clo}
                      onChange={(e) => setVisibleCols({ ...visibleCols, clo: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>CLO</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.competencies}
                      onChange={(e) =>
                        setVisibleCols({ ...visibleCols, competencies: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Competencies</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.mappingLevel}
                      onChange={(e) =>
                        setVisibleCols({ ...visibleCols, mappingLevel: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Level (I/R/M)</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.bloom}
                      onChange={(e) => setVisibleCols({ ...visibleCols, bloom: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Bloom</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.weight}
                      onChange={(e) => setVisibleCols({ ...visibleCols, weight: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Weight %</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.mlo}
                      onChange={(e) => setVisibleCols({ ...visibleCols, mlo: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>MLO Units</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleCols.evidence}
                      onChange={(e) => setVisibleCols({ ...visibleCols, evidence: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Assessment Evidence</span>
                  </label>
                </div>
              </div>

              {/* PUBLICATION-GRADE SINGLE DOCUMENT CONTAINER (A4 / Printable Paper) */}
              <div
                id="unified-single-doc-paper"
                className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 font-sans text-slate-900"
              >
                {/* 1. Header & Institutional Metadata */}
                <div className="border-b-2 border-slate-900 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {institutionName} • {departmentName}
                        </span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1.5 leading-tight tracking-tight">
                        SINGLE DOCUMENT SPECIFICATION: I.EMLO ➔ PLO ➔ CLO WITH COMPETENCIES ALIGNED
                      </h1>
                      <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                        Course Code: <span className="text-indigo-900">{course.code}</span> — {course.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Credit Hours: {course.creditHours} Units • Delivery Mode: {course.deliveryMode || 'Face-to-Face'} • Academic Level: {course.courseLevel || 'Undergraduate'}
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 space-y-1 text-xs">
                      <div className="inline-block border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold text-indigo-900 shadow-2xs">
                        Official Accreditation Dossier Form
                      </div>
                      <div className="text-slate-600">
                        Framework: <strong>{course.accreditationFramework || 'Outcome-Based Education'}</strong>
                      </div>
                      <div className="text-slate-400 font-mono text-[10px]">
                        Certified Date: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Educational Philosophy & Constructive Alignment Architecture */}
                <div className="space-y-2 text-xs">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>1. Institutional Mission &amp; Constructive Alignment Premise</span>
                  </h2>
                  <p className="text-slate-600 leading-relaxed font-normal">
                    This single document defines the verified constructive alignment between Institutional Educational Mission Learning Outcomes (<strong>I.EMLO</strong>), Degree Program Learning Outcomes (<strong>PLO</strong>), Course Learning Outcomes (<strong>CLO</strong>), and specific <strong>Target Competencies</strong>. Each learning outcome maps to cognitive tiers of Bloom’s Taxonomy and requires direct performance evidence for accreditation compliance under international outcome-based education standards.
                  </p>
                </div>

                {/* 3. The Unified I.EMLO ➔ PLO ➔ CLO with Competencies Alignment Matrix */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                      <Table className="w-4 h-4 text-indigo-600" />
                      <span>2. Aligned I.EMLO ➔ PLO ➔ CLO with Competencies Matrix</span>
                    </h2>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
                      <span className="font-bold text-indigo-700">{clos.length} Course Outcomes</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-700">{plos.length} Program Outcomes</span>
                      <span>•</span>
                      <span className="font-bold text-purple-700">{emlos.length} Mission Outcomes</span>
                    </div>
                  </div>

                  {/* Unified Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-300 shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                          {visibleCols.emlo && (
                            <th className="p-3 border-r border-slate-300 min-w-[170px] bg-slate-100/90">
                              Institutional Outcome (I.EMLO)
                            </th>
                          )}
                          {visibleCols.plo && (
                            <th className="p-3 border-r border-slate-300 min-w-[160px]">
                              Program Outcome (PLO)
                            </th>
                          )}
                          {visibleCols.clo && (
                            <th className="p-3 border-r border-slate-300 min-w-[220px]">
                              Course Learning Outcome (CLO)
                            </th>
                          )}
                          {visibleCols.bloom && (
                            <th className="p-3 border-r border-slate-300 w-24 text-center">
                              Bloom Level
                            </th>
                          )}
                          {visibleCols.mappingLevel && (
                            <th className="p-3 border-r border-slate-300 w-24 text-center">
                              Alignment
                            </th>
                          )}
                          {visibleCols.competencies && (
                            <th className="p-3 border-r border-slate-300 min-w-[170px]">
                              Target Competency &amp; Skills
                            </th>
                          )}
                          {visibleCols.weight && (
                            <th className="p-3 border-r border-slate-300 w-20 text-center">
                              Weight
                            </th>
                          )}
                          {visibleCols.mlo && (
                            <th className="p-3 border-r border-slate-300 min-w-[150px]">
                              Supporting MLO Units
                            </th>
                          )}
                          {visibleCols.evidence && (
                            <th className="p-3 min-w-[160px]">
                              Assessment Evidence Method
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {emlos.map((emlo) => {
                          // Find PLOs associated with this EMLO
                          const mappedPloIds = Object.keys(emloPloMap[emlo.id] || {});
                          const linkedPLOs = plos.filter(
                            (p) => mappedPloIds.includes(p.id) || (emlo.mappedPLOIds || []).includes(p.id)
                          );
                          const activePLOs = linkedPLOs.length > 0 ? linkedPLOs : plos.slice(0, 1);

                          return activePLOs.map((plo, ploIdx) => {
                            // Find CLOs mapped to this PLO
                            const linkedCLOs = clos.filter((c) =>
                              (c.mappedPLOs || []).some((m) => m.ploId === plo.id)
                            );
                            const activeCLOs = linkedCLOs.length > 0 ? linkedCLOs : clos.slice(0, 1);

                            return activeCLOs.map((clo, cloIdx) => {
                              const mappingRecord = (clo.mappedPLOs || []).find((m) => m.ploId === plo.id);
                              const level = mappingRecord?.level || 'Reinforced';
                              const childMLOs = mlos.filter((m) => m.linkedCLOId === clo.id);

                              const isFirstRowOfEMLO = ploIdx === 0 && cloIdx === 0;

                              const levelBadgeColor =
                                level === 'Mastered'
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : level === 'Reinforced'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-sky-100 text-sky-900 border-sky-300';

                              return (
                                <tr
                                  key={`${emlo.id}__${plo.id}__${clo.id}`}
                                  className="hover:bg-slate-50/80 transition-colors"
                                >
                                  {/* Column: I.EMLO */}
                                  {visibleCols.emlo && (
                                    <td className="p-3 border-r border-slate-200 align-top bg-slate-50/40">
                                      <div className="font-mono font-bold text-slate-900 text-xs">
                                        {emlo.code}
                                      </div>
                                      <div className="font-semibold text-slate-800 text-[11px] mt-0.5">
                                        {emlo.title}
                                      </div>
                                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2" title={emlo.statement}>
                                        {emlo.statement}
                                      </p>
                                    </td>
                                  )}

                                  {/* Column: PLO */}
                                  {visibleCols.plo && (
                                    <td className="p-3 border-r border-slate-200 align-top">
                                      <div className="font-mono font-bold text-indigo-900 text-xs bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded inline-block">
                                        {plo.code}
                                      </div>
                                      <div className="font-bold text-slate-800 text-[11px] mt-1">
                                        {plo.title}
                                      </div>
                                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2" title={plo.description}>
                                        {plo.description}
                                      </p>
                                    </td>
                                  )}

                                  {/* Column: CLO */}
                                  {visibleCols.clo && (
                                    <td className="p-3 border-r border-slate-200 align-top">
                                      <div className="font-mono font-bold text-slate-900 text-xs">
                                        {clo.code}
                                      </div>
                                      <p className="text-slate-800 font-medium text-xs leading-relaxed mt-0.5">
                                        {clo.statement}
                                      </p>
                                    </td>
                                  )}

                                  {/* Column: Bloom Level */}
                                  {visibleCols.bloom && (
                                    <td className="p-3 border-r border-slate-200 align-top text-center">
                                      <span className="font-bold text-indigo-700 block">
                                        L{BLOOM_RANK[clo.bloomLevel]}
                                      </span>
                                      <span className="text-[11px] font-semibold text-slate-700 block">
                                        {clo.bloomLevel}
                                      </span>
                                      {clo.bloomVerb && (
                                        <span className="text-[9px] text-slate-400 block mt-0.5">
                                          Verb: {clo.bloomVerb}
                                        </span>
                                      )}
                                    </td>
                                  )}

                                  {/* Column: Mapping Level (I/R/M) */}
                                  {visibleCols.mappingLevel && (
                                    <td className="p-3 border-r border-slate-200 align-top text-center">
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-2xs ${levelBadgeColor}`}
                                      >
                                        [{level[0]}] {level}
                                      </span>
                                    </td>
                                  )}

                                  {/* Column: Competencies & Skills */}
                                  {visibleCols.competencies && (
                                    <td className="p-3 border-r border-slate-200 align-top">
                                      {clo.competency ? (
                                        <div className="space-y-1">
                                          <div className="flex items-center space-x-1 font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                            <Award className="w-3 h-3 text-emerald-600 shrink-0" />
                                            <span className="truncate">{clo.competency}</span>
                                          </div>
                                          {clo.skills && (
                                            <div className="text-[10px] text-slate-500">
                                              Skills: {clo.skills}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 text-[11px] italic">General Engineering Competency</span>
                                      )}
                                    </td>
                                  )}

                                  {/* Column: Weight % */}
                                  {visibleCols.weight && (
                                    <td className="p-3 border-r border-slate-200 align-top text-center font-mono font-bold text-slate-700">
                                      {clo.weightage ?? 20}%
                                    </td>
                                  )}

                                  {/* Column: Supporting MLOs */}
                                  {visibleCols.mlo && (
                                    <td className="p-3 border-r border-slate-200 align-top">
                                      {childMLOs.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {childMLOs.map((m) => (
                                            <span
                                              key={m.id}
                                              className="inline-block font-mono text-[9px] bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded"
                                              title={m.statement}
                                            >
                                              {m.code}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 text-[10px] italic">Integrated Units</span>
                                      )}
                                    </td>
                                  )}

                                  {/* Column: Assessment Evidence */}
                                  {visibleCols.evidence && (
                                    <td className="p-3 align-top">
                                      <div className="text-slate-800 font-semibold text-[11px]">
                                        {clo.assessmentMethod || 'Summative & Formative Direct Assessment'}
                                      </div>
                                      <div className="text-[10px] text-slate-500 mt-0.5">
                                        Achievement Benchmark: ≥ {clo.achievementThreshold || 60}%
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              );
                            });
                          });
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Cross-Cutting Institutional Mission (I.EMLO) Attainment Summary */}
                <div className="space-y-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 flex items-center space-x-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>3. Institutional Mission Outcome (I.EMLO) Alignment Summary</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {emlos.map((emlo) => {
                      const mappedPloIds = Object.keys(emloPloMap[emlo.id] || {});
                      const countPLOs = plos.filter(
                        (p) => mappedPloIds.includes(p.id) || (emlo.mappedPLOIds || []).includes(p.id)
                      ).length;

                      const countCLOs = clos.filter((c) =>
                        (c.mappedPLOs || []).some(
                          (m) => mappedPloIds.includes(m.ploId) || (emlo.mappedPLOIds || []).includes(m.ploId)
                        )
                      ).length;

                      return (
                        <div
                          key={emlo.id}
                          className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                              {emlo.code}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {countPLOs} PLOs • {countCLOs} CLOs
                            </span>
                          </div>
                          <div className="font-bold text-slate-800 text-xs leading-snug">{emlo.title}</div>
                          <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">
                            {emlo.statement}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Board of Studies Sign-off & Quality Assurance Block */}
                <div className="pt-6 border-t-2 border-slate-900 space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>4. Academic Quality Verification &amp; Board of Studies Endorsement</span>
                  </h2>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                    This single document specification has been validated through institutional constructive alignment verification protocols, confirming that each Course Learning Outcome directly substantiates the targeted Program Learning Outcomes and satisfies Institutional Educational Mission Learning Outcomes (I.EMLOs).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs">
                    <div className="border-t border-slate-400 pt-2">
                      <span className="font-bold text-slate-900 block">Course Lead / Designer</span>
                      <span className="text-[10px] text-slate-500 block">Signature &amp; Verification Date</span>
                    </div>
                    <div className="border-t border-slate-400 pt-2">
                      <span className="font-bold text-slate-900 block">Head of Curriculum Committee</span>
                      <span className="text-[10px] text-slate-500 block">Signature &amp; Verification Date</span>
                    </div>
                    <div className="border-t border-slate-400 pt-2">
                      <span className="font-bold text-slate-900 block">Academic Dean / Accreditation Chair</span>
                      <span className="text-[10px] text-slate-500 block">Official Institutional Seal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* VIEW 2: INTERACTIVE CUSTOM MAPPING STUDIO               */
            /* ======================================================= */
            <div className="space-y-6">
              {/* Studio Navigation & Sub-tabs */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMappingSubTab('universal')}
                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                      mappingSubTab === 'universal'
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Map ANY level to ANY other level (Universal Matrix)"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Any-to-Any Universal Matrix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMappingSubTab('emlo_plo')}
                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                      mappingSubTab === 'emlo_plo'
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Map Institutional Educational Mission Outcomes to Program Outcomes"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>I.EMLO ➔ PLO Mapper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMappingSubTab('clo_plo')}
                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                      mappingSubTab === 'clo_plo'
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Map Course Learning Outcomes to Program Outcomes"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>CLO ➔ PLO Matrix (I/R/M)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMappingSubTab('competencies')}
                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                      mappingSubTab === 'competencies'
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Link course outcomes to target competencies & skills"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Competency Mapping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMappingSubTab('mlo_clo')}
                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                      mappingSubTab === 'mlo_clo'
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Organize modular learning units into parent CLOs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>MLO ➔ CLO Hierarchy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMappingSubTab('emlo_manager')}
                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                      mappingSubTab === 'emlo_manager'
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Manage institutional mission outcomes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>I.EMLO Manager</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAutoAlignAll}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    title="Auto-align any unlinked outcomes"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Auto-Harmonize</span>
                  </button>
                </div>
              </div>

              {/* --------------------------------------------------------- */}
              {/* SUB-TAB 1: UNIVERSAL ANY-TO-ANY CUSTOM MAPPING MATRIX     */}
              {/* --------------------------------------------------------- */}
              {mappingSubTab === 'universal' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
                  {/* Dimension Pickers */}
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[10px] font-extrabold uppercase">
                          Custom Mapping Configurator
                        </span>
                        <h3 className="text-sm font-black text-slate-900">
                          Map ANY Source Dimension to ANY Target Dimension
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600">
                        Choose any two outcome tiers. Click any matrix intersection cell to set or toggle alignment level ([I] Introduced, [R] Reinforced, [M] Mastered, [D] Direct).
                      </p>
                    </div>

                    {/* Source & Target Pickers */}
                    <div className="flex items-center space-x-3 text-xs shrink-0">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Source Dimension (Rows)
                        </label>
                        <select
                          value={sourceDimension}
                          onChange={(e) => setSourceDimension(e.target.value as MappingDimension)}
                          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                        >
                          <option value="emlo">I.EMLO (Institutional Outcomes)</option>
                          <option value="plo">PLO (Program Outcomes)</option>
                          <option value="clo">CLO (Course Outcomes)</option>
                          <option value="competency">Target Competencies</option>
                          <option value="mlo">MLO (Modular Units)</option>
                        </select>
                      </div>

                      <div className="pt-4">
                        <ArrowRight className="w-4 h-4 text-indigo-600" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Target Dimension (Cols)
                        </label>
                        <select
                          value={targetDimension}
                          onChange={(e) => setTargetDimension(e.target.value as MappingDimension)}
                          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                        >
                          <option value="plo">PLO (Program Outcomes)</option>
                          <option value="emlo">I.EMLO (Institutional Outcomes)</option>
                          <option value="clo">CLO (Course Outcomes)</option>
                          <option value="competency">Target Competencies</option>
                          <option value="mlo">MLO (Modular Units)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Matrix Key */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold text-slate-800">
                      Mapping: <strong>{DIMENSION_LABELS[sourceDimension].name}</strong> ➔{' '}
                      <strong>{DIMENSION_LABELS[targetDimension].name}</strong> ({universalSourceEntities.length} × {universalTargetEntities.length})
                    </span>

                    <div className="flex items-center space-x-3 font-semibold">
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-sky-100 border border-sky-400"></span>
                        <span>[I] Introduced</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-400"></span>
                        <span>[R] Reinforced</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-400"></span>
                        <span>[M] Mastered</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-400"></span>
                        <span>[D] Direct</span>
                      </span>
                    </div>
                  </div>

                  {/* Interactive Any-to-Any Matrix Grid */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold">
                          <th className="p-3 border-r border-slate-200 min-w-[200px] sticky left-0 bg-slate-100 z-10">
                            {DIMENSION_LABELS[sourceDimension].short} (Source)
                          </th>
                          {universalTargetEntities.map((target) => (
                            <th
                              key={target.id}
                              className="p-2.5 border-r border-slate-200 text-center min-w-[90px]"
                              title={target.detail}
                            >
                              <div className="font-mono font-bold text-slate-900">{target.code}</div>
                              <div className="text-[10px] text-slate-500 font-normal truncate max-w-[85px] mx-auto">
                                {target.label}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {universalSourceEntities.map((source) => (
                          <tr key={source.id} className="hover:bg-slate-50/70">
                            {/* Source identifier sticky */}
                            <td className="p-3 border-r border-slate-200 align-top sticky left-0 bg-white hover:bg-slate-50 z-10">
                              <div className="font-mono font-bold text-slate-900 text-xs">
                                {source.code}
                              </div>
                              <div className="text-[11px] text-slate-700 font-medium line-clamp-2 mt-0.5" title={source.detail}>
                                {source.label}
                              </div>
                            </td>

                            {/* Target columns: click to toggle cell mapping */}
                            {universalTargetEntities.map((target) => {
                              const cellVal = getUniversalCellValue(source.id, target.id);

                              const badgeColor =
                                cellVal === 'Mastered' || cellVal === 'M'
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : cellVal === 'Reinforced' || cellVal === 'R'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : cellVal === 'Introduced' || cellVal === 'I'
                                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                                  : cellVal === 'Direct' || cellVal === 'D'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-indigo-100 text-indigo-900 border-indigo-300';

                              return (
                                <td
                                  key={target.id}
                                  onClick={() => handleToggleUniversalCell(source.id, target.id)}
                                  className="p-2 border-r border-slate-100 text-center align-middle cursor-pointer hover:bg-indigo-50 transition select-none"
                                  title={`Click to toggle custom mapping: ${source.code} ➔ ${target.code}`}
                                >
                                  {cellVal ? (
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-2xs ${badgeColor}`}
                                    >
                                      [{cellVal[0]}] {cellVal}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs font-mono">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SUB-TAB 2: I.EMLO ➔ PLO ALIGNMENT MAPPER                  */}
              {/* --------------------------------------------------------- */}
              {mappingSubTab === 'emlo_plo' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span>Institutional Mission (I.EMLO) ➔ Program Outcomes (PLO) Mapper</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Click cells to toggle alignment between institutional educational mission outcomes and program graduate attributes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddEMLOModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom I.EMLO</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold">
                          <th className="p-3 border-r border-slate-200 min-w-[240px]">
                            Institutional Outcome (I.EMLO)
                          </th>
                          {plos.map((plo) => (
                            <th key={plo.id} className="p-3 border-r border-slate-200 text-center min-w-[90px]">
                              <div className="font-mono font-bold text-slate-900">{plo.code}</div>
                              <div className="text-[10px] text-slate-500 font-normal truncate max-w-[80px]" title={plo.title}>
                                {plo.title}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {emlos.map((emlo) => (
                          <tr key={emlo.id} className="hover:bg-slate-50">
                            <td className="p-3 border-r border-slate-200">
                              <span className="font-mono font-bold text-indigo-900 mr-2">{emlo.code}</span>
                              <span className="font-semibold text-slate-800">{emlo.title}</span>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{emlo.statement}</p>
                            </td>

                            {plos.map((plo) => {
                              const currentLevel =
                                emloPloMap[emlo.id]?.[plo.id] ||
                                (emlo.mappedPLOIds?.includes(plo.id) ? 'Mastered' : null);

                              return (
                                <td
                                  key={plo.id}
                                  onClick={() => handleCycleEMLOPLOMapping(emlo.id, plo.id)}
                                  className="p-3 border-r border-slate-100 text-center align-middle cursor-pointer hover:bg-indigo-50/60 transition select-none"
                                >
                                  {currentLevel ? (
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border shadow-2xs ${
                                        currentLevel === 'Mastered'
                                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                                          : currentLevel === 'Reinforced'
                                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                          : 'bg-sky-100 text-sky-900 border-sky-300'
                                      }`}
                                    >
                                      {String(currentLevel)[0]} ({String(currentLevel)})
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs font-mono">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SUB-TAB 3: CLO ➔ PLO ALIGNMENT MATRIX                     */}
              {/* --------------------------------------------------------- */}
              {mappingSubTab === 'clo_plo' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span>Course Learning Outcome (CLO) ➔ Program Outcome (PLO) Matrix</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Map course outcomes to degree program outcomes. Click any cell to toggle level ([I] Introduced ➔ [R] Reinforced ➔ [M] Mastered ➔ None).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddPLOModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom PLO</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold">
                          <th className="p-3 border-r border-slate-200 min-w-[220px]">
                            Course Outcome (CLO)
                          </th>
                          {plos.map((plo) => (
                            <th key={plo.id} className="p-3 border-r border-slate-200 text-center min-w-[90px]">
                              <div className="font-mono font-bold text-slate-900">{plo.code}</div>
                              <div className="text-[10px] text-slate-500 font-normal truncate max-w-[80px]" title={plo.title}>
                                {plo.title}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {clos.map((clo) => (
                          <tr key={clo.id} className="hover:bg-slate-50">
                            <td className="p-3 border-r border-slate-200">
                              <span className="font-mono font-bold text-slate-900 mr-2">{clo.code}</span>
                              <span className="font-semibold text-indigo-800 text-[11px] block">{clo.bloomLevel} ({clo.weightage}%)</span>
                              <span className="text-slate-600 text-[11px] line-clamp-2">{clo.statement}</span>
                            </td>

                            {plos.map((plo) => {
                              const mapped = (clo.mappedPLOs || []).find((m) => m.ploId === plo.id);
                              const level = mapped?.level;

                              return (
                                <td
                                  key={plo.id}
                                  onClick={() => handleCycleCLOPLOMapping(clo.id, plo.id)}
                                  className="p-3 border-r border-slate-100 text-center align-middle cursor-pointer hover:bg-indigo-50/60 transition select-none"
                                >
                                  {level ? (
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border shadow-2xs ${
                                        level === 'Mastered'
                                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                                          : level === 'Reinforced'
                                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                          : 'bg-sky-100 text-sky-900 border-sky-300'
                                      }`}
                                    >
                                      {level[0]} ({level})
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs font-mono">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SUB-TAB 4: COMPETENCY MAPPING                             */}
              {/* --------------------------------------------------------- */}
              {mappingSubTab === 'competencies' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Custom Competencies &amp; Skills Alignment Manager</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Connect each target competency to corresponding course learning outcomes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddCompetencyModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Competency</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {targetCompetencies.map((comp) => {
                      const mappedCLOs = clos.filter((c) => c.competency === comp);

                      return (
                        <div
                          key={comp}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                              <Award className="w-4 h-4 text-emerald-600" />
                              <span>{comp}</span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              {mappedCLOs.length} CLOs Linked
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-slate-500 block">
                              Link Course Outcomes:
                            </span>
                            {clos.map((clo) => {
                              const isLinked = clo.competency === comp;
                              return (
                                <button
                                  key={clo.id}
                                  type="button"
                                  onClick={() => handleToggleCLOCompetency(clo.id, comp)}
                                  className={`w-full text-left p-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                                    isLinked
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>
                                    <strong>{clo.code}</strong>: {clo.statement.substring(0, 45)}...
                                  </span>
                                  {isLinked ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <span className="text-slate-400 text-[10px] font-semibold">+ Link</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SUB-TAB 5: MLO ➔ CLO HIERARCHY MAPPER                     */}
              {/* --------------------------------------------------------- */}
              {mappingSubTab === 'mlo_clo' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>Modular Learning Outcomes (MLO) ➔ Course Outcomes (CLO)</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Assign each module learning outcome to its parent CLO, or create custom MLOs.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddMLOModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom MLO</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {mlos.map((mlo) => (
                      <div
                        key={mlo.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {mlo.code}
                            </span>
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              L{BLOOM_RANK[mlo.bloomLevel]} {mlo.bloomLevel}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">{mlo.statement}</p>
                        </div>

                        {/* Parent CLO Selector */}
                        <div className="flex items-center space-x-2 shrink-0 bg-white p-2 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-700">Parent CLO:</span>
                          <select
                            value={mlo.linkedCLOId || ''}
                            onChange={(e) => handleUpdateMLOParentCLO(mlo.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">Unlinked</option>
                            {clos.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.code}: {c.statement.substring(0, 30)}...
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* SUB-TAB 6: I.EMLO MANAGER (ADD / EDIT / RESET EMLOs)       */}
              {/* --------------------------------------------------------- */}
              {mappingSubTab === 'emlo_manager' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span>Institutional Educational Mission Learning Outcomes (I.EMLO) Manager</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Configure institutional mission outcomes. You can create custom I.EMLOs, adjust domains, or restore defaults.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleRestoreDefaultEMLOs}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Restore Defaults</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAddEMLOModal(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Custom I.EMLO</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emlos.map((emlo) => (
                      <div
                        key={emlo.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {emlo.code}
                            </span>
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              {emlo.bloomLevel || 'Analyze'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteEMLO(emlo.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                            title="Delete I.EMLO"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="font-bold text-slate-900 text-sm">{emlo.title}</div>
                        <p className="text-slate-600 text-xs leading-relaxed">{emlo.statement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER                                              */}
        {/* ========================================================= */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              All custom mappings across I.EMLO, PLO, CLO, and Competencies are saved in real-time.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer shadow-xs"
          >
            Done &amp; Close
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD CUSTOM I.EMLO                                */}
      {/* ========================================================= */}
      {showAddEMLOModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                Add Custom Educational Mission Outcome (I.EMLO)
              </h4>
              <button
                type="button"
                onClick={() => setShowAddEMLOModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomEMLO} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">I.EMLO Code</label>
                <input
                  type="text"
                  value={newEMLO.code}
                  onChange={(e) => setNewEMLO({ ...newEMLO, code: e.target.value })}
                  placeholder="e.g. I.EMLO 5"
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={newEMLO.title}
                  onChange={(e) => setNewEMLO({ ...newEMLO, title: e.target.value })}
                  placeholder="e.g. Entrepreneurial Leadership & Commercialization"
                  className="w-full border border-slate-200 rounded-lg p-2 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Outcome Statement</label>
                <textarea
                  value={newEMLO.statement}
                  onChange={(e) => setNewEMLO({ ...newEMLO, statement: e.target.value })}
                  placeholder="Articulate institutional mission outcome..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bloom Level</label>
                  <select
                    value={newEMLO.bloomLevel}
                    onChange={(e) => setNewEMLO({ ...newEMLO, bloomLevel: e.target.value as BloomLevel })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    {BLOOM_ORDER.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl} (L{BLOOM_RANK[lvl]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Domain</label>
                  <select
                    value={newEMLO.targetDomain}
                    onChange={(e) =>
                      setNewEMLO({ ...newEMLO, targetDomain: e.target.value as LearningDomain })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="Cognitive">Cognitive</option>
                    <option value="Affective">Affective</option>
                    <option value="Psychomotor">Psychomotor</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEMLOModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Create I.EMLO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD CUSTOM PLO                                   */}
      {/* ========================================================= */}
      {showAddPLOModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Add Custom Program Outcome (PLO)</h4>
              <button
                type="button"
                onClick={() => setShowAddPLOModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomPLO} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">PLO Identifier</label>
                <input
                  type="text"
                  value={newPLO.code}
                  onChange={(e) => setNewPLO({ ...newPLO, code: e.target.value })}
                  placeholder="e.g. PLO 6"
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={newPLO.title}
                  onChange={(e) => setNewPLO({ ...newPLO, title: e.target.value })}
                  placeholder="e.g. Cybersecurity & Defense"
                  className="w-full border border-slate-200 rounded-lg p-2 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={newPLO.description}
                  onChange={(e) => setNewPLO({ ...newPLO, description: e.target.value })}
                  placeholder="Graduate competency description..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPLOModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Create PLO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD CUSTOM COMPETENCY                            */}
      {/* ========================================================= */}
      {showAddCompetencyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Add Target Competency</h4>
              <button
                type="button"
                onClick={() => setShowAddCompetencyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCompetency} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Competency Name</label>
                <input
                  type="text"
                  value={newCompetencyName}
                  onChange={(e) => setNewCompetencyName(e.target.value)}
                  placeholder="e.g. Distributed Cloud Architecture"
                  className="w-full border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCompetencyModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Add Competency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD CUSTOM MLO                                   */}
      {/* ========================================================= */}
      {showAddMLOModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Add Custom Modular Outcome (MLO)</h4>
              <button
                type="button"
                onClick={() => setShowAddMLOModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomMLO} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">MLO Identifier</label>
                <input
                  type="text"
                  value={newMLO.code}
                  onChange={(e) => setNewMLO({ ...newMLO, code: e.target.value })}
                  placeholder="e.g. MLO 1.2.1"
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent CLO Link</label>
                <select
                  value={newMLO.linkedCLOId}
                  onChange={(e) => setNewMLO({ ...newMLO, linkedCLOId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {clos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.statement.substring(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">MLO Statement</label>
                <textarea
                  value={newMLO.statement}
                  onChange={(e) => setNewMLO({ ...newMLO, statement: e.target.value })}
                  placeholder="Articulate specific modular outcome..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bloom Level</label>
                  <select
                    value={newMLO.bloomLevel}
                    onChange={(e) => setNewMLO({ ...newMLO, bloomLevel: e.target.value as BloomLevel })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    {BLOOM_ORDER.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl} (L{BLOOM_RANK[lvl]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bloom Verb</label>
                  <input
                    type="text"
                    value={newMLO.bloomVerb}
                    onChange={(e) => setNewMLO({ ...newMLO, bloomVerb: e.target.value })}
                    placeholder="e.g. Implement"
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMLOModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Create MLO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
