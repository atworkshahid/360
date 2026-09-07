import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  MarkerType,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Clock,
  BookOpen,
  FileCheck2,
  Scale,
  Brain,
  Zap,
  Info,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Table,
  GitGraph,
  Sliders,
  Award,
} from 'lucide-react';
import { Course, CLO, Activity, Assessment, BloomLevel, ActivityType } from '../../types';
import {
  analyzeConstructiveAlignment,
  AlignmentGap,
  AlignmentGapType,
  AlignedTriad,
  autoCreateAlignedActivity,
  autoCreateAlignedAssessment,
  harmonizeBloomLevels,
  inferActivityBloomLevel,
} from '../../services/constructiveAlignmentService';
import { BLOOM_ORDER, BLOOM_RANK } from '../../utils/assessmentAnalysis';

// Helper for Bloom level badge styling
const getBloomBadgeClasses = (level: BloomLevel): string => {
  switch (level) {
    case 'Create':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Evaluate':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Analyze':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Apply':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Understand':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Remember':
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

// ==========================================
// CUSTOM NODE 1: Course Learning Outcome (CLO)
// ==========================================
interface CLONodeData {
  clo: CLO;
  triad: AlignedTriad;
  isSelected?: boolean;
  isDimmed?: boolean;
  isFocused?: boolean;
  orientation: 'horizontal' | 'vertical';
  onSelectNode: (id: string, type: 'clo' | 'tla' | 'assessment') => void;
}

const CLONodeComponent: React.FC<{ data: CLONodeData }> = ({ data }) => {
  const { clo, triad, isSelected, isDimmed, isFocused, orientation, onSelectNode } = data;
  const bloomBadge = getBloomBadgeClasses(clo.bloomLevel);

  const hasActivityGap = triad.hasActivityGap;
  const hasAssessmentGap = triad.hasAssessmentGap;
  const isHealthy = triad.isHealthy;

  return (
    <div
      onClick={() => onSelectNode(clo.id, 'clo')}
      className={`w-76 rounded-2xl border transition-all duration-200 shadow-sm bg-white p-3.5 text-left relative select-none cursor-pointer ${
        isSelected
          ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-md scale-[1.02]'
          : isFocused
          ? 'border-indigo-500 ring-2 ring-indigo-400/20 shadow-sm'
          : !isHealthy
          ? 'border-amber-300 bg-gradient-to-br from-white to-amber-50/20 hover:border-amber-400'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      } ${isDimmed ? 'opacity-20 filter grayscale' : 'opacity-100'}`}
    >
      {/* Handles */}
      {orientation === 'horizontal' ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="clo-target"
            className="w-3 h-3 bg-blue-600 border-2 border-white -ml-1.5 shadow-xs"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="clo-source"
            className="w-3 h-3 bg-blue-600 border-2 border-white -mr-1.5 shadow-xs"
          />
        </>
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="clo-target"
            className="w-3 h-3 bg-blue-600 border-2 border-white -mt-1.5 shadow-xs"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="clo-source"
            className="w-3 h-3 bg-blue-600 border-2 border-white -mb-1.5 shadow-xs"
          />
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-xs font-bold shadow-2xs">
            {clo.code}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${bloomBadge}`}>
            {clo.bloomLevel}
          </span>
        </div>

        {/* Alignment Status Pill */}
        {isHealthy ? (
          <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
            <span>Aligned</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
            <span>Gap Alert</span>
          </span>
        )}
      </div>

      {/* CLO Statement */}
      <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed mb-2" title={clo.statement}>
        {clo.statement}
      </p>

      {/* Gap Badges */}
      {(hasActivityGap || hasAssessmentGap) && (
        <div className="space-y-1 mb-2">
          {hasActivityGap && (
            <div className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-amber-200">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-amber-600" />
              <span>Missing TLA (Untaught Outcome)</span>
            </div>
          )}
          {hasAssessmentGap && (
            <div className="text-[10px] font-bold text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-rose-200">
              <XCircle className="w-2.5 h-2.5 shrink-0 text-rose-600" />
              <span>Missing Assessment (Unmeasured)</span>
            </div>
          )}
        </div>
      )}

      {/* Metadata Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
        <span className="font-semibold text-slate-600">Weight: {clo.weightage || 0}%</span>
        <div className="flex items-center space-x-2">
          <span title="Linked Learning Activities" className="flex items-center space-x-0.5 font-medium">
            <BookOpen className="w-3 h-3 text-indigo-500" />
            <span>{triad.activities.length} TLA</span>
          </span>
          <span title="Linked Assessments" className="flex items-center space-x-0.5 font-medium">
            <FileCheck2 className="w-3 h-3 text-emerald-600" />
            <span>{triad.assessments.length} Asmt</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// ====================================================
// CUSTOM NODE 2: Teaching & Learning Activity (TLA)
// ====================================================
interface TLANodeData {
  activity: Activity;
  targetCLO?: CLO;
  cognitiveMatch: 'optimal' | 'deficit' | 'higher-order';
  isOrphan: boolean;
  hasDownstreamAssessment: boolean;
  isSelected?: boolean;
  isDimmed?: boolean;
  isFocused?: boolean;
  orientation: 'horizontal' | 'vertical';
  onSelectNode: (id: string, type: 'clo' | 'tla' | 'assessment') => void;
}

const TLANodeComponent: React.FC<{ data: TLANodeData }> = ({ data }) => {
  const {
    activity,
    targetCLO,
    cognitiveMatch,
    isOrphan,
    hasDownstreamAssessment,
    isSelected,
    isDimmed,
    isFocused,
    orientation,
    onSelectNode,
  } = data;

  const inferredBloom = inferActivityBloomLevel(activity.activityType);
  const bloomBadge = getBloomBadgeClasses(inferredBloom);

  return (
    <div
      onClick={() => onSelectNode(activity.id, 'tla')}
      className={`w-76 rounded-2xl border transition-all duration-200 shadow-sm bg-white p-3.5 text-left relative select-none cursor-pointer ${
        isSelected
          ? 'border-indigo-600 ring-4 ring-indigo-500/20 shadow-md scale-[1.02]'
          : isFocused
          ? 'border-indigo-400 ring-2 ring-indigo-300/30'
          : isOrphan
          ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
      } ${isDimmed ? 'opacity-20 filter grayscale' : 'opacity-100'}`}
    >
      {/* Handles */}
      {orientation === 'horizontal' ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="tla-target"
            className="w-3 h-3 bg-indigo-600 border-2 border-white -ml-1.5 shadow-xs"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="tla-source"
            className="w-3 h-3 bg-indigo-600 border-2 border-white -mr-1.5 shadow-xs"
          />
        </>
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="tla-target"
            className="w-3 h-3 bg-indigo-600 border-2 border-white -mt-1.5 shadow-xs"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="tla-source"
            className="w-3 h-3 bg-indigo-600 border-2 border-white -mb-1.5 shadow-xs"
          />
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-200">
            {activity.activityType}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${bloomBadge}`}>
            {inferredBloom}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-medium">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{activity.estimatedMins || 45}m</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1" title={activity.title}>
        {activity.title}
      </h4>

      {/* Evidence Produced preview */}
      {activity.evidenceProduced && (
        <p className="text-[10px] text-slate-500 line-clamp-1 italic mb-2 bg-slate-50 p-1 rounded border border-slate-100">
          <span className="font-semibold text-slate-600 not-italic">Output: </span>
          {activity.evidenceProduced}
        </p>
      )}

      {/* Gap status pills */}
      {isOrphan ? (
        <div className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-amber-200 mb-1">
          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
          <span>Orphan Activity (Untracked)</span>
        </div>
      ) : cognitiveMatch === 'deficit' ? (
        <div className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-amber-200 mb-1">
          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
          <span>Cognitive Deficit vs {targetCLO?.code}</span>
        </div>
      ) : !hasDownstreamAssessment ? (
        <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-blue-200 mb-1">
          <Info className="w-2.5 h-2.5 shrink-0" />
          <span>Formative Practice Only</span>
        </div>
      ) : (
        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-emerald-200 mb-1">
          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
          <span>Practices {targetCLO?.code || 'CLO'}</span>
        </div>
      )}
    </div>
  );
};

// ====================================================
// CUSTOM NODE 3: Assessment Evidence & Tasks
// ====================================================
interface AssessmentEvidenceNodeData {
  assessment: Assessment;
  targetCLO?: CLO;
  cognitiveMatch: 'optimal' | 'deficit' | 'higher-order';
  isOrphan: boolean;
  isUnpracticed: boolean;
  hasDirectEvidence: boolean;
  hasEvidenceRule: boolean;
  isSelected?: boolean;
  isDimmed?: boolean;
  isFocused?: boolean;
  orientation: 'horizontal' | 'vertical';
  onSelectNode: (id: string, type: 'clo' | 'tla' | 'assessment') => void;
}

const AssessmentEvidenceNodeComponent: React.FC<{ data: AssessmentEvidenceNodeData }> = ({ data }) => {
  const {
    assessment,
    targetCLO,
    cognitiveMatch,
    isOrphan,
    isUnpracticed,
    hasDirectEvidence,
    hasEvidenceRule,
    isSelected,
    isDimmed,
    isFocused,
    orientation,
    onSelectNode,
  } = data;

  const bloomBadge = getBloomBadgeClasses(assessment.bloomLevel);

  return (
    <div
      onClick={() => onSelectNode(assessment.id, 'assessment')}
      className={`w-76 rounded-2xl border transition-all duration-200 shadow-sm bg-white p-3.5 text-left relative select-none cursor-pointer ${
        isSelected
          ? 'border-emerald-600 ring-4 ring-emerald-500/20 shadow-md scale-[1.02]'
          : isFocused
          ? 'border-emerald-400 ring-2 ring-emerald-300/30'
          : isOrphan || isUnpracticed || cognitiveMatch === 'deficit'
          ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
          : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
      } ${isDimmed ? 'opacity-20 filter grayscale' : 'opacity-100'}`}
    >
      {/* Handles */}
      {orientation === 'horizontal' ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="asmt-target"
            className="w-3 h-3 bg-emerald-600 border-2 border-white -ml-1.5 shadow-xs"
          />
        </>
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="asmt-target"
            className="w-3 h-3 bg-emerald-600 border-2 border-white -mt-1.5 shadow-xs"
          />
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
            {assessment.type}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${bloomBadge}`}>
            {assessment.bloomLevel}
          </span>
        </div>

        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
            hasDirectEvidence ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {hasDirectEvidence ? 'Direct Proof' : 'Indirect Proof'}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1" title={assessment.name}>
        {assessment.name}
      </h4>

      {/* Badges / Warnings */}
      {isOrphan ? (
        <div className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-rose-200 mb-1.5">
          <XCircle className="w-2.5 h-2.5 shrink-0" />
          <span>Orphan Assessment (No CLO)</span>
        </div>
      ) : isUnpracticed ? (
        <div className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-amber-200 mb-1.5">
          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
          <span>Unpracticed Assessment</span>
        </div>
      ) : cognitiveMatch === 'deficit' ? (
        <div className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-rose-200 mb-1.5">
          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
          <span>Rigor Deficit vs {targetCLO?.code}</span>
        </div>
      ) : (
        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-emerald-200 mb-1.5">
          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
          <span>Aligned Evidence for {targetCLO?.code || 'CLO'}</span>
        </div>
      )}

      {/* Footer Details */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
        <span className="font-semibold text-slate-700">Course Weight: {assessment.weightage || 0}%</span>
        <span className="text-slate-500">
          {hasEvidenceRule ? 'Threshold Rule Active' : 'No Explicit Rule'}
        </span>
      </div>
    </div>
  );
};

const nodeTypes = {
  cloNode: CLONodeComponent,
  tlaNode: TLANodeComponent,
  asmtNode: AssessmentEvidenceNodeComponent,
};

// ====================================================
// INNER GRAPH CANVAS COMPONENT
// ====================================================
interface InnerGraphProps {
  course: Course;
  report: ReturnType<typeof analyzeConstructiveAlignment>;
  onChangeCourse?: (updated: Course) => void;
  onAskCopilot?: (prompt: string) => void;
  onJumpToStep?: (stepNumber: number) => void;
  filterGapType: string;
  filterCLOId: string;
  searchQuery: string;
  orientation: 'horizontal' | 'vertical';
  selectedNode: { id: string; type: 'clo' | 'tla' | 'assessment' } | null;
  onSelectNode: (id: string, type: 'clo' | 'tla' | 'assessment') => void;
}

const ConstructiveAlignmentFlowCanvas: React.FC<InnerGraphProps> = ({
  course,
  report,
  onChangeCourse,
  onAskCopilot,
  onJumpToStep,
  filterGapType,
  filterCLOId,
  searchQuery,
  orientation,
  selectedNode,
  onSelectNode,
}) => {
  const { fitView } = useReactFlow();

  // Highlight connected nodes when a node is selected
  const activeChain = useMemo(() => {
    if (!selectedNode) return null;
    const { id, type } = selectedNode;
    const nodeIds = new Set<string>([id]);
    const edgeIds = new Set<string>();

    if (type === 'clo') {
      const triad = report.triads.find((t) => t.clo.id === id);
      if (triad) {
        triad.activities.forEach((a) => {
          nodeIds.add(a.activity.id);
          edgeIds.add(`edge-clo-tla-${id}-${a.activity.id}`);
        });
        triad.assessments.forEach((asmt) => {
          nodeIds.add(asmt.assessment.id);
          edgeIds.add(`edge-clo-asmt-${id}-${asmt.assessment.id}`);
          triad.activities.forEach((a) => {
            edgeIds.add(`edge-tla-asmt-${a.activity.id}-${asmt.assessment.id}`);
          });
        });
      }
    } else if (type === 'tla') {
      report.triads.forEach((t) => {
        const found = t.activities.some((a) => a.activity.id === id);
        if (found) {
          nodeIds.add(t.clo.id);
          edgeIds.add(`edge-clo-tla-${t.clo.id}-${id}`);
          t.assessments.forEach((asmt) => {
            nodeIds.add(asmt.assessment.id);
            edgeIds.add(`edge-tla-asmt-${id}-${asmt.assessment.id}`);
          });
        }
      });
    } else if (type === 'assessment') {
      report.triads.forEach((t) => {
        const found = t.assessments.some((a) => a.assessment.id === id);
        if (found) {
          nodeIds.add(t.clo.id);
          edgeIds.add(`edge-clo-asmt-${t.clo.id}-${id}`);
          t.activities.forEach((a) => {
            nodeIds.add(a.activity.id);
            edgeIds.add(`edge-tla-asmt-${a.activity.id}-${id}`);
          });
        }
      });
    }

    return { nodeIds, edgeIds };
  }, [selectedNode, report]);

  // Compute Nodes and Edges
  const { nodes, edges } = useMemo(() => {
    const nList: Node[] = [];
    const eList: Edge[] = [];

    const query = searchQuery.trim().toLowerCase();
    const isHorizontal = orientation === 'horizontal';

    // Track column positions
    // In horizontal: CLO (x: 40), TLA (x: 420), Assessment (x: 800)
    // In vertical: CLO (y: 40), TLA (y: 320), Assessment (y: 600)
    const colX_CLO = 40;
    const colX_TLA = 420;
    const colX_ASMT = 800;

    let cloY = 40;
    let tlaY = 40;
    let asmtY = 40;

    const verticalSpacing = 160;

    // Filter CLOs
    const filteredTriads = report.triads.filter((triad) => {
      if (filterCLOId !== 'all' && triad.clo.id !== filterCLOId) return false;
      if (filterGapType === 'gaps-only' && triad.isHealthy) return false;
      if (filterGapType === 'missing-tla' && !triad.hasActivityGap) return false;
      if (filterGapType === 'missing-assessment' && !triad.hasAssessmentGap) return false;
      if (filterGapType === 'cognitive-mismatch' && !triad.hasCognitiveDeficit) return false;

      if (query) {
        const matchesCLO =
          triad.clo.code.toLowerCase().includes(query) ||
          triad.clo.statement.toLowerCase().includes(query) ||
          triad.clo.bloomLevel.toLowerCase().includes(query);
        const matchesTLA = triad.activities.some(
          (a) =>
            a.activity.title.toLowerCase().includes(query) ||
            a.activity.activityType.toLowerCase().includes(query)
        );
        const matchesAsmt = triad.assessments.some(
          (a) =>
            a.assessment.name.toLowerCase().includes(query) ||
            a.assessment.type.toLowerCase().includes(query)
        );
        if (!matchesCLO && !matchesTLA && !matchesAsmt) return false;
      }

      return true;
    });

    const renderedActivityIds = new Set<string>();
    const renderedAssessmentIds = new Set<string>();

    filteredTriads.forEach((triad) => {
      const isCLOSelected = selectedNode?.id === triad.clo.id;
      const isCLODimmed = activeChain !== null && !activeChain.nodeIds.has(triad.clo.id);

      // Add CLO Node
      const cloPosX = isHorizontal ? colX_CLO : cloY;
      const cloPosY = isHorizontal ? cloY : colX_CLO;

      nList.push({
        id: triad.clo.id,
        type: 'cloNode',
        position: { x: cloPosX, y: cloPosY },
        data: {
          clo: triad.clo,
          triad,
          isSelected: isCLOSelected,
          isDimmed: isCLODimmed,
          orientation,
          onSelectNode,
        },
      });

      cloY += verticalSpacing;

      // Add Activities for this CLO
      triad.activities.forEach((actWrap) => {
        const act = actWrap.activity;
        if (!renderedActivityIds.has(act.id)) {
          renderedActivityIds.add(act.id);

          const isTLASelected = selectedNode?.id === act.id;
          const isTLADimmed = activeChain !== null && !activeChain.nodeIds.has(act.id);

          const tlaPosX = isHorizontal ? colX_TLA : tlaY;
          const tlaPosY = isHorizontal ? tlaY : colX_TLA;

          nList.push({
            id: act.id,
            type: 'tlaNode',
            position: { x: tlaPosX, y: tlaPosY },
            data: {
              activity: act,
              targetCLO: triad.clo,
              cognitiveMatch: actWrap.cognitiveMatch,
              isOrphan: false,
              hasDownstreamAssessment: triad.assessments.length > 0,
              isSelected: isTLASelected,
              isDimmed: isTLADimmed,
              orientation,
              onSelectNode,
            },
          });

          tlaY += verticalSpacing;
        }

        // Edge from CLO -> TLA
        const edgeId = `edge-clo-tla-${triad.clo.id}-${act.id}`;
        const isEdgeActive = activeChain !== null && activeChain.edgeIds.has(edgeId);
        const isDeficit = actWrap.cognitiveMatch === 'deficit';

        eList.push({
          id: edgeId,
          source: triad.clo.id,
          target: act.id,
          sourceHandle: isHorizontal ? 'clo-source' : 'clo-source',
          targetHandle: isHorizontal ? 'tla-target' : 'tla-target',
          animated: isEdgeActive,
          style: {
            stroke: isDeficit ? '#f59e0b' : isEdgeActive ? '#4f46e5' : '#818cf8',
            strokeWidth: isEdgeActive ? 3 : 2,
            strokeDasharray: isDeficit ? '5 5' : undefined,
            opacity: activeChain !== null && !isEdgeActive ? 0.2 : 0.85,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isDeficit ? '#f59e0b' : isEdgeActive ? '#4f46e5' : '#818cf8',
            width: 14,
            height: 14,
          },
        });
      });

      // Add Assessments for this CLO
      triad.assessments.forEach((asmtWrap) => {
        const asmt = asmtWrap.assessment;
        if (!renderedAssessmentIds.has(asmt.id)) {
          renderedAssessmentIds.add(asmt.id);

          const isAsmtSelected = selectedNode?.id === asmt.id;
          const isAsmtDimmed = activeChain !== null && !activeChain.nodeIds.has(asmt.id);

          const asmtPosX = isHorizontal ? colX_ASMT : asmtY;
          const asmtPosY = isHorizontal ? asmtY : colX_ASMT;

          nList.push({
            id: asmt.id,
            type: 'asmtNode',
            position: { x: asmtPosX, y: asmtPosY },
            data: {
              assessment: asmt,
              targetCLO: triad.clo,
              cognitiveMatch: asmtWrap.cognitiveMatch,
              isOrphan: false,
              isUnpracticed: triad.activities.length === 0,
              hasDirectEvidence: asmtWrap.hasDirectEvidence,
              hasEvidenceRule: !!asmtWrap.evidenceRule,
              isSelected: isAsmtSelected,
              isDimmed: isAsmtDimmed,
              orientation,
              onSelectNode,
            },
          });

          asmtY += verticalSpacing;
        }

        // Link TLA -> Assessment if activity exists
        if (triad.activities.length > 0) {
          triad.activities.forEach((actWrap) => {
            const edgeId = `edge-tla-asmt-${actWrap.activity.id}-${asmt.id}`;
            const isEdgeActive = activeChain !== null && activeChain.edgeIds.has(edgeId);

            eList.push({
              id: edgeId,
              source: actWrap.activity.id,
              target: asmt.id,
              sourceHandle: isHorizontal ? 'tla-source' : 'tla-source',
              targetHandle: isHorizontal ? 'asmt-target' : 'asmt-target',
              animated: isEdgeActive,
              style: {
                stroke: isEdgeActive ? '#059669' : '#34d399',
                strokeWidth: isEdgeActive ? 3 : 2,
                opacity: activeChain !== null && !isEdgeActive ? 0.2 : 0.85,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isEdgeActive ? '#059669' : '#34d399',
                width: 14,
                height: 14,
              },
            });
          });
        } else {
          // Direct CLO -> Assessment edge (unpracticed gap!)
          const edgeId = `edge-clo-asmt-${triad.clo.id}-${asmt.id}`;
          const isEdgeActive = activeChain !== null && activeChain.edgeIds.has(edgeId);

          eList.push({
            id: edgeId,
            source: triad.clo.id,
            target: asmt.id,
            sourceHandle: 'clo-source',
            targetHandle: 'asmt-target',
            animated: true,
            style: {
              stroke: '#f43f5e',
              strokeWidth: 2,
              strokeDasharray: '6 4',
              opacity: activeChain !== null && !isEdgeActive ? 0.2 : 0.9,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f43f5e',
              width: 14,
              height: 14,
            },
          });
        }
      });
    });

    // Add orphan activities if filter allows
    if (filterCLOId === 'all' && (filterGapType === 'all' || filterGapType === 'gaps-only')) {
      report.orphanActivities.forEach((act) => {
        const isTLASelected = selectedNode?.id === act.id;
        const isTLADimmed = activeChain !== null && !activeChain.nodeIds.has(act.id);

        const tlaPosX = isHorizontal ? colX_TLA : tlaY;
        const tlaPosY = isHorizontal ? tlaY : colX_TLA;

        nList.push({
          id: act.id,
          type: 'tlaNode',
          position: { x: tlaPosX, y: tlaPosY },
          data: {
            activity: act,
            cognitiveMatch: 'deficit',
            isOrphan: true,
            hasDownstreamAssessment: false,
            isSelected: isTLASelected,
            isDimmed: isTLADimmed,
            orientation,
            onSelectNode,
          },
        });
        tlaY += verticalSpacing;
      });

      // Add orphan assessments
      report.orphanAssessments.forEach((asmt) => {
        const isAsmtSelected = selectedNode?.id === asmt.id;
        const isAsmtDimmed = activeChain !== null && !activeChain.nodeIds.has(asmt.id);

        const asmtPosX = isHorizontal ? colX_ASMT : asmtY;
        const asmtPosY = isHorizontal ? asmtY : colX_ASMT;

        nList.push({
          id: asmt.id,
          type: 'asmtNode',
          position: { x: asmtPosX, y: asmtPosY },
          data: {
            assessment: asmt,
            cognitiveMatch: 'deficit',
            isOrphan: true,
            isUnpracticed: true,
            hasDirectEvidence: asmt.evidenceType === 'Direct',
            hasEvidenceRule: false,
            isSelected: isAsmtSelected,
            isDimmed: isAsmtDimmed,
            orientation,
            onSelectNode,
          },
        });
        asmtY += verticalSpacing;
      });
    }

    return { nodes: nList, edges: eList };
  }, [report, filterGapType, filterCLOId, searchQuery, orientation, selectedNode, activeChain, onSelectNode]);

  return (
    <div className="w-full h-full relative bg-slate-50/70 select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background color="#cbd5e1" gap={24} size={1} />
        <Controls className="bg-white rounded-xl shadow-md border border-slate-200" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'cloNode') return '#3b82f6';
            if (n.type === 'tlaNode') return '#6366f1';
            return '#10b981';
          }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
          zoomable
          pannable
        />

        {/* Legend Panel */}
        <Panel position="bottom-right" className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-lg text-[11px] space-y-1.5 max-w-xs">
          <div className="font-bold text-slate-800 flex items-center justify-between border-b pb-1">
            <span>Constructive Alignment Key</span>
            <span className="text-[10px] text-slate-400">John Biggs Model</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-0.5 text-[10px]">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 shrink-0"></span>
              <span className="font-semibold text-slate-700">1. CLO</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-indigo-600 shrink-0"></span>
              <span className="font-semibold text-slate-700">2. TLA</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 shrink-0"></span>
              <span className="font-semibold text-slate-700">3. Evidence</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-0.5 bg-indigo-600 inline-block"></span>
              <span>Aligned Flow</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-600 font-semibold">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500 inline-block"></span>
              <span>Alignment Gap</span>
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// ====================================================
// MAIN COMPONENT: ConstructiveAlignmentDashboard
// ====================================================
export interface ConstructiveAlignmentDashboardProps {
  course: Course;
  onChangeCourse?: (updatedCourse: Course) => void;
  onAskCopilot?: (prompt: string) => void;
  onJumpToStep?: (stepNumber: number) => void;
  height?: string | number;
}

export const ConstructiveAlignmentDashboard: React.FC<ConstructiveAlignmentDashboardProps> = ({
  course,
  onChangeCourse,
  onAskCopilot,
  onJumpToStep,
  height = '680px',
}) => {
  const [viewMode, setViewMode] = useState<'diagram' | 'table'>('diagram');
  const [filterGapType, setFilterGapType] = useState<string>('all');
  const [filterCLOId, setFilterCLOId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedNode, setSelectedNode] = useState<{ id: string; type: 'clo' | 'tla' | 'assessment' } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Compute Alignment Report
  const report = useMemo(() => analyzeConstructiveAlignment(course), [course]);

  const handleSelectNode = useCallback((id: string, type: 'clo' | 'tla' | 'assessment') => {
    setSelectedNode({ id, type });
    setDrawerOpen(true);
  }, []);

  // Selected item detail for drawer
  const selectedDetails = useMemo(() => {
    if (!selectedNode) return null;
    const { id, type } = selectedNode;

    if (type === 'clo') {
      const clo = course.clos?.find((c) => c.id === id);
      const triad = report.triads.find((t) => t.clo.id === id);
      return { type: 'clo' as const, clo, triad };
    } else if (type === 'tla') {
      const act = course.activities?.find((a) => a.id === id);
      const parentTriad = report.triads.find((t) => t.activities.some((a) => a.activity.id === id));
      return { type: 'tla' as const, activity: act, parentTriad };
    } else if (type === 'assessment') {
      const asmt = course.assessments?.find((a) => a.id === id);
      const parentTriad = report.triads.find((t) => t.assessments.some((a) => a.assessment.id === id));
      return { type: 'assessment' as const, assessment: asmt, parentTriad };
    }
    return null;
  }, [selectedNode, course, report]);

  // Quick Remediation Handlers
  const handleAutoRemediateActivity = (cloId: string) => {
    if (!onChangeCourse) return;
    const updated = autoCreateAlignedActivity(course, cloId);
    onChangeCourse(updated);
  };

  const handleAutoRemediateAssessment = (cloId: string) => {
    if (!onChangeCourse) return;
    const updated = autoCreateAlignedAssessment(course, cloId);
    onChangeCourse(updated);
  };

  const handleHarmonizeBloom = (cloId: string) => {
    if (!onChangeCourse) return;
    const updated = harmonizeBloomLevels(course, cloId);
    onChangeCourse(updated);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Executive Constructive Alignment KPIs */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                <GitGraph className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight font-serif">
                Constructive Alignment Node-Link Mapping Dashboard
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                CLO ➔ TLA ➔ Assessment Evidence
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Based on John Biggs' Constructive Alignment framework: Intended Learning Outcomes (CLOs) must be activated through authentic Teaching &amp; Learning Activities (TLAs) and evaluated by Direct Assessment Evidence.
            </p>
          </div>

          {/* KPI Indicators */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {/* Index score */}
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/10 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-400/40 flex flex-col items-center justify-center bg-slate-900/60">
                <span className="text-sm font-black text-white">{report.overallScore}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                  Alignment Index
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {report.overallScore >= 80 ? 'Accredited Rigor' : 'Gaps Flagged'}
                </span>
              </div>
            </div>

            {/* Complete Triads */}
            <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-left">
              <span className="text-[10px] text-slate-400 block font-semibold">Active Triads</span>
              <span className="text-sm font-bold text-white">
                {report.completeTriadsCount} / {report.totalCLOs}
              </span>
            </div>

            {/* Gaps count */}
            <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-left">
              <span className="text-[10px] text-slate-400 block font-semibold">Identified Gaps</span>
              <span className={`text-sm font-bold ${report.gaps.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {report.gaps.length} issue{report.gaps.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Copilot Advice */}
            {onAskCopilot && (
              <button
                type="button"
                id="alignment-copilot-consult-btn"
                onClick={() =>
                  onAskCopilot(
                    `Review the Constructive Alignment report for "${course.title}". We identified ${report.gaps.length} alignment gaps between CLOs, Teaching Activities, and Assessment Evidence. Propose a concrete remediation plan according to ABET and OBE criteria.`
                  )
                }
                className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Copilot Audit</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Cognitive Concordance:</span>
            <span className="font-bold text-white">{report.cognitiveConcordanceRate}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Direct Evidence Fidelity:</span>
            <span className="font-bold text-white">{report.evidenceFidelityRate}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Active Learning Tasks:</span>
            <span className="font-bold text-white">{report.totalActivitiesCount} TLAs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Assessment Tasks:</span>
            <span className="font-bold text-white">{report.totalAssessmentsCount} Tasks</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Controls & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center flex-wrap gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              id="alignment-view-diagram-btn"
              onClick={() => setViewMode('diagram')}
              className={`px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
                viewMode === 'diagram' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitGraph className="w-3.5 h-3.5" />
              <span>Node-Link Graph</span>
            </button>
            <button
              type="button"
              id="alignment-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Triad Table</span>
            </button>
          </div>

          {/* Gap Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="alignment-gap-filter-select"
              value={filterGapType}
              onChange={(e) => setFilterGapType(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Pathways &amp; Links</option>
              <option value="gaps-only">Show Only Alignment Gaps ({report.gaps.length})</option>
              <option value="missing-tla">Missing TLAs (Unpracticed)</option>
              <option value="missing-assessment">Missing Assessments (Unmeasured)</option>
              <option value="cognitive-mismatch">Cognitive Bloom Mismatches</option>
            </select>
          </div>

          {/* CLO Selector */}
          <select
            id="alignment-clo-filter-select"
            value={filterCLOId}
            onChange={(e) => setFilterCLOId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="all">All Course Outcomes ({course.clos.length})</option>
            {course.clos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.statement.slice(0, 32)}...
              </option>
            ))}
          </select>

          {/* Orientation (Diagram only) */}
          {viewMode === 'diagram' && (
            <button
              type="button"
              id="alignment-orientation-toggle-btn"
              onClick={() => setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center space-x-1 transition cursor-pointer"
              title="Toggle Layout Orientation"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>{orientation === 'horizontal' ? 'Horizontal (3-Column)' : 'Vertical (Waterfall)'}</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="alignment-search-input"
            type="text"
            placeholder="Search CLO, TLA, task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* 3. Main Display Area: Diagram or Triad Table */}
      {viewMode === 'diagram' ? (
        <div
          className="w-full rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white relative"
          style={{ height }}
        >
          <ReactFlowProvider>
            <ConstructiveAlignmentFlowCanvas
              course={course}
              report={report}
              onChangeCourse={onChangeCourse}
              onAskCopilot={onAskCopilot}
              onJumpToStep={onJumpToStep}
              filterGapType={filterGapType}
              filterCLOId={filterCLOId}
              searchQuery={searchQuery}
              orientation={orientation}
              selectedNode={selectedNode}
              onSelectNode={handleSelectNode}
            />
          </ReactFlowProvider>

          {/* Quick instructions floating prompt */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-[11px] text-slate-600 flex items-center space-x-2 pointer-events-none">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Click any node to inspect alignment pathway &amp; resolve gaps</span>
          </div>
        </div>
      ) : (
        /* High-Density Triad Matrix Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-1/4">1. Course Outcome (CLO)</th>
                  <th className="py-3 px-4 w-1/4">2. Teaching &amp; Learning Activities (TLA)</th>
                  <th className="py-3 px-4 w-1/4">3. Assessment Evidence Tasks</th>
                  <th className="py-3 px-4 w-1/4">Alignment Status &amp; Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.triads.map((triad) => (
                  <tr
                    key={triad.clo.id}
                    className={`hover:bg-slate-50/60 transition ${
                      !triad.isHealthy ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Column 1: CLO */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[10px]">
                            {triad.clo.code}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${getBloomBadgeClasses(
                              triad.clo.bloomLevel
                            )}`}
                          >
                            {triad.clo.bloomLevel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {triad.clo.weightage}% wt
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium line-clamp-3 leading-snug">
                          {triad.clo.statement}
                        </p>
                      </div>
                    </td>

                    {/* Column 2: TLAs */}
                    <td className="py-3 px-4 align-top">
                      {triad.activities.length > 0 ? (
                        <div className="space-y-1.5">
                          {triad.activities.map((a) => (
                            <div
                              key={a.activity.id}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 line-clamp-1">
                                  {a.activity.title}
                                </span>
                                <span className="text-[9px] text-slate-500 shrink-0">
                                  {a.activity.estimatedMins || 45}m
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                                  {a.activity.activityType}
                                </span>
                                {a.cognitiveMatch === 'deficit' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                    Bloom Deficit
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>No TLA mapped. Students have no practice task!</span>
                        </div>
                      )}
                    </td>

                    {/* Column 3: Assessments & Evidence */}
                    <td className="py-3 px-4 align-top">
                      {triad.assessments.length > 0 ? (
                        <div className="space-y-1.5">
                          {triad.assessments.map((asmt) => (
                            <div
                              key={asmt.assessment.id}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 line-clamp-1">
                                  {asmt.assessment.name}
                                </span>
                                <span className="text-[9px] text-slate-500 font-semibold shrink-0">
                                  {asmt.assessment.weightage}%
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                                  {asmt.assessment.type}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                                  {asmt.hasDirectEvidence ? 'Direct' : 'Indirect'}
                                </span>
                                {asmt.cognitiveMatch === 'deficit' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                                    Rigor Deficit
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center space-x-1.5">
                          <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                          <span>No assessment evidence mapped!</span>
                        </div>
                      )}
                    </td>

                    {/* Column 4: Status & Quick Actions */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-2">
                        {triad.isHealthy ? (
                          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Constructively Aligned</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {triad.gaps.map((g) => (
                              <div
                                key={g.id}
                                className="text-[10px] p-1.5 rounded-lg bg-amber-50 text-amber-900 font-medium border border-amber-200/80 leading-tight"
                              >
                                <span className="font-bold">{g.title}:</span> {g.recommendation}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quick Action Buttons */}
                        <div className="flex items-center flex-wrap gap-1.5 pt-1">
                          {triad.hasActivityGap && onChangeCourse && (
                            <button
                              type="button"
                              onClick={() => handleAutoRemediateActivity(triad.clo.id)}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 flex items-center space-x-1 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Aligned TLA</span>
                            </button>
                          )}
                          {triad.hasAssessmentGap && onChangeCourse && (
                            <button
                              type="button"
                              onClick={() => handleAutoRemediateAssessment(triad.clo.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center space-x-1 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Evidence Task</span>
                            </button>
                          )}
                          {triad.hasCognitiveDeficit && onChangeCourse && (
                            <button
                              type="button"
                              onClick={() => handleHarmonizeBloom(triad.clo.id)}
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 flex items-center space-x-1 transition cursor-pointer"
                            >
                              <Brain className="w-3 h-3" />
                              <span>Harmonize Bloom</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Interactive Remediation & Detail Drawer */}
      {drawerOpen && selectedDetails && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {selectedDetails.type === 'clo'
                  ? 'CLO'
                  : selectedDetails.type === 'tla'
                  ? 'TLA'
                  : 'TASK'}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {selectedDetails.type === 'clo'
                    ? `Outcome Analysis (${selectedDetails.clo?.code})`
                    : selectedDetails.type === 'tla'
                    ? 'Activity Pathway'
                    : 'Evidence Specification'}
                </h4>
                <p className="text-[10px] text-slate-500">Biggs Constructive Alignment Inspection</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
            {selectedDetails.type === 'clo' && selectedDetails.clo && selectedDetails.triad && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-800 text-xs">
                      {selectedDetails.clo.code}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${getBloomBadgeClasses(
                        selectedDetails.clo.bloomLevel
                      )}`}
                    >
                      {selectedDetails.clo.bloomLevel}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {selectedDetails.clo.statement}
                  </p>
                </div>

                {/* Status Summary */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Constructive Alignment Status
                  </h5>
                  {selectedDetails.triad.isHealthy ? (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start space-x-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <div className="font-bold">Fully Aligned Chain</div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          This outcome is supported by {selectedDetails.triad.activities.length} active learning task(s) and measured by {selectedDetails.triad.assessments.length} assessment task(s) at matching cognitive rigor.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedDetails.triad.gaps.map((gap) => (
                        <div
                          key={gap.id}
                          className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1"
                        >
                          <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{gap.title}</span>
                          </div>
                          <p className="text-[11px] text-amber-800/90 leading-relaxed">{gap.description}</p>
                          <p className="text-[10px] font-bold text-amber-900 pt-1 border-t border-amber-200/60">
                            Remedy: {gap.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auto-Remediation Controls */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    One-Click Remediation
                  </h5>
                  <div className="space-y-1.5">
                    {selectedDetails.triad.hasActivityGap && onChangeCourse && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAutoRemediateActivity(selectedDetails.clo.id);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Auto-Generate Aligned Activity</span>
                      </button>
                    )}
                    {selectedDetails.triad.hasAssessmentGap && onChangeCourse && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAutoRemediateAssessment(selectedDetails.clo.id);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Auto-Generate Assessment &amp; Rule</span>
                      </button>
                    )}
                    {selectedDetails.triad.hasCognitiveDeficit && onChangeCourse && (
                      <button
                        type="button"
                        onClick={() => {
                          handleHarmonizeBloom(selectedDetails.clo.id);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>Harmonize Bloom Rigor</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Navigation jump */}
                {onJumpToStep && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => onJumpToStep(8)}
                      className="text-indigo-600 hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <span>Stage 08 Activities</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onJumpToStep(9)}
                      className="text-emerald-700 hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <span>Stage 09 Assessments</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Selected Activity */}
            {selectedDetails.type === 'tla' && selectedDetails.activity && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    {selectedDetails.activity.activityType}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">{selectedDetails.activity.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {selectedDetails.activity.studentActionPrompt}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="font-bold text-slate-700">Evidence Produced:</div>
                  <p className="text-slate-600 italic">
                    {selectedDetails.activity.evidenceProduced || 'No explicit artifact specified.'}
                  </p>
                </div>

                {selectedDetails.parentTriad ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] space-y-1">
                    <div className="font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Target Outcome: {selectedDetails.parentTriad.clo.code}</span>
                    </div>
                    <p className="text-[10px] text-emerald-700">
                      Prepares students for:{' '}
                      {selectedDetails.parentTriad.assessments.map((a) => a.assessment.name).join(', ') ||
                        'Formative reflection only'}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                    This activity is not currently linked to any CLO or MLO.
                  </div>
                )}
              </div>
            )}

            {/* Selected Assessment */}
            {selectedDetails.type === 'assessment' && selectedDetails.assessment && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {selectedDetails.assessment.type}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {selectedDetails.assessment.weightage}% weight
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{selectedDetails.assessment.name}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[9px] uppercase">Cognitive Rigor</span>
                    <span className="font-bold text-slate-800">{selectedDetails.assessment.bloomLevel}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[9px] uppercase">Evidence Type</span>
                    <span className="font-bold text-slate-800">
                      {selectedDetails.assessment.evidenceType || 'Direct'}
                    </span>
                  </div>
                </div>

                {selectedDetails.parentTriad && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] space-y-1">
                    <div className="font-bold">Verifies Mastery for:</div>
                    <p className="text-[11px] font-semibold text-blue-800">
                      {selectedDetails.parentTriad.clo.code}: {selectedDetails.parentTriad.clo.statement}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
