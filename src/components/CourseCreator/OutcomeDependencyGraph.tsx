import React, { useMemo, useState, useCallback } from 'react';
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
  Connection,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Sparkles,
  Layers,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  Split,
  Search,
  ArrowRight,
  HelpCircle,
  Shuffle,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Course, PLO, CLO, MappingLevel, BloomLevel } from '../../types';

// Custom PLO Node Component
interface PLONodeData {
  plo: PLO;
  mappedCount: number;
  introducedCount: number;
  reinforcedCount: number;
  masteredCount: number;
  isSelected?: boolean;
  isDimmed?: boolean;
  orientation: 'horizontal' | 'vertical';
  flowDirection: 'clo-to-plo' | 'plo-to-clo';
}

const PLOCustomNode: React.FC<{ data: PLONodeData }> = ({ data }) => {
  const {
    plo,
    mappedCount,
    introducedCount,
    reinforcedCount,
    masteredCount,
    isSelected,
    isDimmed,
    orientation,
    flowDirection,
  } = data;
  const isUnmapped = mappedCount === 0;

  // In horizontal:
  // if flow is 'clo-to-plo', PLOs are targets on the right -> target handle on Left
  // if flow is 'plo-to-clo', PLOs are sources on the left -> source handle on Right
  // To allow bi-directional drag connections, provide handles on both sides with semantic defaults
  return (
    <div
      className={`w-72 rounded-2xl border transition-all duration-200 shadow-sm bg-white p-3.5 text-left relative select-none ${
        isSelected
          ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-md scale-[1.02]'
          : isUnmapped
          ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      } ${isDimmed ? 'opacity-25 filter grayscale' : 'opacity-100'}`}
    >
      {/* Handles */}
      {orientation === 'horizontal' ? (
        <>
          <Handle
            type={flowDirection === 'clo-to-plo' ? 'target' : 'source'}
            position={Position.Left}
            id="handle-left"
            className="w-3.5 h-3.5 bg-blue-600 border-2 border-white -ml-2 shadow-xs cursor-crosshair hover:scale-125 transition-transform"
          />
          <Handle
            type={flowDirection === 'clo-to-plo' ? 'source' : 'target'}
            position={Position.Right}
            id="handle-right"
            className="w-3.5 h-3.5 bg-blue-600 border-2 border-white -mr-2 shadow-xs cursor-crosshair hover:scale-125 transition-transform"
          />
        </>
      ) : (
        <>
          <Handle
            type={flowDirection === 'clo-to-plo' ? 'target' : 'source'}
            position={Position.Top}
            id="handle-top"
            className="w-3.5 h-3.5 bg-blue-600 border-2 border-white -mt-2 shadow-xs cursor-crosshair hover:scale-125 transition-transform"
          />
          <Handle
            type={flowDirection === 'clo-to-plo' ? 'source' : 'target'}
            position={Position.Bottom}
            id="handle-bottom"
            className="w-3.5 h-3.5 bg-blue-600 border-2 border-white -mb-2 shadow-xs cursor-crosshair hover:scale-125 transition-transform"
          />
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-xs font-bold border border-blue-200">
            {plo.code}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Program Outcome
          </span>
        </div>

        {isUnmapped ? (
          <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
            <span>Unmapped Gap</span>
          </span>
        ) : (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {mappedCount} CLO{mappedCount > 1 ? 's' : ''} mapped
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug mb-1" title={plo.title}>
        {plo.title}
      </h4>

      {/* Description / Summary */}
      {plo.description && (
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight mb-2">
          {plo.description}
        </p>
      )}

      {/* Mastery Level Distribution Pills */}
      {!isUnmapped ? (
        <div className="flex items-center space-x-1.5 pt-1.5 border-t border-slate-100 text-[10px]">
          {introducedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              {introducedCount} Introduced
            </span>
          )}
          {reinforcedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              {reinforcedCount} Reinforced
            </span>
          )}
          {masteredCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              {masteredCount} Mastered
            </span>
          )}
        </div>
      ) : (
        <div className="pt-1.5 border-t border-slate-100 text-[10px] text-amber-700 font-medium italic">
          No course outcome currently feeds this program outcome
        </div>
      )}
    </div>
  );
};

// Custom CLO Node Component
interface CLONodeData {
  clo: CLO;
  mappedCount: number;
  isSelected?: boolean;
  isDimmed?: boolean;
  orientation: 'horizontal' | 'vertical';
  flowDirection: 'clo-to-plo' | 'plo-to-clo';
}

const getBloomBadgeColor = (level: BloomLevel) => {
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
      return 'bg-slate-100 text-slate-800 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const CLOCustomNode: React.FC<{ data: CLONodeData }> = ({ data }) => {
  const { clo, mappedCount, isSelected, isDimmed, orientation, flowDirection } = data;
  const isUnmapped = mappedCount === 0;

  return (
    <div
      className={`w-80 rounded-2xl border transition-all duration-200 shadow-sm bg-white p-3.5 text-left relative select-none ${
        isSelected
          ? 'border-indigo-600 ring-4 ring-indigo-500/20 shadow-md scale-[1.02]'
          : isUnmapped
          ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
      } ${isDimmed ? 'opacity-25 filter grayscale' : 'opacity-100'}`}
    >
      {/* Handles */}
      {orientation === 'horizontal' ? (
        <>
          <Handle
            type={flowDirection === 'clo-to-plo' ? 'source' : 'target'}
            position={Position.Left}
            id="handle-left"
            className="w-3.5 h-3.5 bg-indigo-600 border-2 border-white -ml-2 shadow-xs cursor-crosshair hover:scale-125 transition-transform"
          />
          <Handle
            type={flowDirection === 'clo-to-plo' ? 'source' : 'target'}
            position={Position.Right}
            id="handle-right"
            className="w-3.5 h-3.5 bg-indigo-600 border-2 border-white -mr-2 shadow-xs cursor-crosshair hover:scale-125 transition-transform"
          />
        </>
      ) : (
        <>
          <Handle
            type={flowDirection === 'clo-to-plo' ? 'source' : 'target'}
            position={Position.Top}
            id="handle-top"
            className="w-3.5 h-3.5 bg-indigo-600 border-2 border-white -mt-2 shadow-xs cursor-crosshair hover:scale-125 transition-transform"
          />
          <Handle
            type={flowDirection === 'clo-to-plo' ? 'source' : 'target'}
            position={Position.Bottom}
            id="handle-bottom"
            className="w-3.5 h-3.5 bg-indigo-600 border-2 border-white -mb-2 shadow-xs cursor-crosshair hover:scale-125 transition-transform"
          />
        </>
      )}

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-mono text-xs font-bold border border-indigo-200">
            {clo.code}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getBloomBadgeColor(
              clo.bloomLevel
            )}`}
          >
            {clo.bloomVerb || clo.bloomLevel}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {clo.weightage || 0}%
          </span>
          {isUnmapped ? (
            <span className="flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              <span>Orphan CLO</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {mappedCount} PLO{mappedCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Outcome Statement */}
      <p className="text-xs text-slate-800 font-medium line-clamp-3 leading-relaxed mb-2" title={clo.statement}>
        "{clo.statement}"
      </p>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
        <span>Level: {clo.bloomLevel}</span>
        {clo.qualityScore !== undefined && (
          <span className="font-bold text-indigo-600">Quality: {clo.qualityScore}%</span>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  ploNode: PLOCustomNode,
  cloNode: CLOCustomNode,
};

interface OutcomeDependencyGraphProps {
  course: Course;
  onUpdateCourse: (updated: Course) => void;
  onAskCopilot?: (prompt: string) => void;
  height?: string | number;
  initialSelectedNodeId?: string;
  readOnly?: boolean;
}

export const OutcomeDependencyGraphInner: React.FC<OutcomeDependencyGraphProps> = ({
  course,
  onUpdateCourse,
  onAskCopilot,
  height = '620px',
  initialSelectedNodeId,
  readOnly = false,
}) => {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [flowDirection, setFlowDirection] = useState<'clo-to-plo' | 'plo-to-clo'>('clo-to-plo');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Introduced' | 'Reinforced' | 'Mastered' | 'unmapped'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialSelectedNodeId || null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showQuickConnectModal, setShowQuickConnectModal] = useState<boolean>(false);
  const [newConnectCLO, setNewConnectCLO] = useState<string>('');
  const [newConnectPLO, setNewConnectPLO] = useState<string>('');
  const [newConnectLevel, setNewConnectLevel] = useState<MappingLevel>('Reinforced');
  const [newConnectRationale, setNewConnectRationale] = useState<string>('');

  const plos = useMemo(() => course.plos || [], [course.plos]);
  const clos = useMemo(() => course.clos || [], [course.clos]);

  // Connected edge & node ID lookup for active selection highlights
  const connectedIds = useMemo(() => {
    if (!selectedNodeId) return null;
    const ids = new Set<string>([selectedNodeId]);

    // If selected is a CLO, find all mapped PLOs
    const clo = clos.find((c) => c.id === selectedNodeId);
    if (clo) {
      (clo.mappedPLOs || []).forEach((m) => {
        ids.add(m.ploId);
        ids.add(`edge-${clo.id}-${m.ploId}`);
      });
    }

    // If selected is a PLO, find all CLOs that map to it
    const plo = plos.find((p) => p.id === selectedNodeId);
    if (plo) {
      clos.forEach((c) => {
        const hasMapping = (c.mappedPLOs || []).some((m) => m.ploId === plo.id);
        if (hasMapping) {
          ids.add(c.id);
          ids.add(`edge-${c.id}-${plo.id}`);
        }
      });
    }

    return ids;
  }, [selectedNodeId, clos, plos]);

  // Construct Nodes
  const nodes: Node[] = useMemo(() => {
    const list: Node[] = [];

    const ploSpacing = 165;
    const cloSpacing = 175;

    // Filter by text search if query is provided
    const query = searchQuery.trim().toLowerCase();

    // 1. PLO Nodes
    plos.forEach((plo, index) => {
      let mappedCount = 0;
      let introducedCount = 0;
      let reinforcedCount = 0;
      let masteredCount = 0;

      clos.forEach((c) => {
        const m = (c.mappedPLOs || []).find((map) => map.ploId === plo.id);
        if (m) {
          mappedCount++;
          if (m.level === 'Introduced') introducedCount++;
          else if (m.level === 'Reinforced') reinforcedCount++;
          else if (m.level === 'Mastered') masteredCount++;
        }
      });

      const isSelected = selectedNodeId === plo.id;
      const isDimmed = connectedIds !== null && !connectedIds.has(plo.id);

      // Search match
      if (
        query &&
        !(plo.code || '').toLowerCase().includes(query) &&
        !(plo.title || '').toLowerCase().includes(query) &&
        !(plo.description || '').toLowerCase().includes(query)
      ) {
        return;
      }

      // Filter check
      if (levelFilter === 'unmapped' && mappedCount > 0) return;
      if (levelFilter === 'Introduced' && introducedCount === 0) return;
      if (levelFilter === 'Reinforced' && reinforcedCount === 0) return;
      if (levelFilter === 'Mastered' && masteredCount === 0) return;

      // Position logic:
      // If flowDirection === 'clo-to-plo': CLOs are on Left (x: 60), PLOs are on Right (x: 520)
      // If flowDirection === 'plo-to-clo': PLOs are on Left (x: 60), CLOs are on Right (x: 520)
      let posX = 60;
      let posY = index * ploSpacing + 60;

      if (orientation === 'horizontal') {
        posX = flowDirection === 'clo-to-plo' ? 520 : 60;
        posY = index * ploSpacing + 60;
      } else {
        // Vertical layout: Top or Bottom
        posX = index * 320 + 60;
        posY = flowDirection === 'clo-to-plo' ? 420 : 60;
      }

      list.push({
        id: plo.id,
        type: 'ploNode',
        position: { x: posX, y: posY },
        data: {
          plo,
          mappedCount,
          introducedCount,
          reinforcedCount,
          masteredCount,
          isSelected,
          isDimmed,
          orientation,
          flowDirection,
        },
      });
    });

    // 2. CLO Nodes
    clos.forEach((clo, index) => {
      const mappedCount = (clo.mappedPLOs || []).length;
      const isSelected = selectedNodeId === clo.id;
      const isDimmed = connectedIds !== null && !connectedIds.has(clo.id);

      // Search match
      if (
        query &&
        !(clo.code || '').toLowerCase().includes(query) &&
        !(clo.statement || '').toLowerCase().includes(query) &&
        !(clo.bloomVerb || '').toLowerCase().includes(query)
      ) {
        return;
      }

      // Filter check
      if (levelFilter === 'unmapped' && mappedCount > 0) return;
      if (
        levelFilter === 'Introduced' &&
        !(clo.mappedPLOs || []).some((m) => m.level === 'Introduced')
      ) {
        return;
      }
      if (
        levelFilter === 'Reinforced' &&
        !(clo.mappedPLOs || []).some((m) => m.level === 'Reinforced')
      ) {
        return;
      }
      if (
        levelFilter === 'Mastered' &&
        !(clo.mappedPLOs || []).some((m) => m.level === 'Mastered')
      ) {
        return;
      }

      let posX = 60;
      let posY = index * cloSpacing + 60;

      if (orientation === 'horizontal') {
        posX = flowDirection === 'clo-to-plo' ? 60 : 520;
        posY = index * cloSpacing + 60;
      } else {
        posX = index * 360 + 60;
        posY = flowDirection === 'clo-to-plo' ? 60 : 420;
      }

      list.push({
        id: clo.id,
        type: 'cloNode',
        position: { x: posX, y: posY },
        data: {
          clo,
          mappedCount,
          isSelected,
          isDimmed,
          orientation,
          flowDirection,
        },
      });
    });

    return list;
  }, [plos, clos, orientation, flowDirection, selectedNodeId, connectedIds, levelFilter, searchQuery]);

  // Construct Edges
  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];

    clos.forEach((clo) => {
      (clo.mappedPLOs || []).forEach((mapping) => {
        const edgeId = `edge-${clo.id}-${mapping.ploId}`;
        const isSelected = selectedEdgeId === edgeId;
        const isHighlighted = connectedIds !== null && connectedIds.has(edgeId);
        const isDimmed = connectedIds !== null && !connectedIds.has(edgeId);

        // Filter check
        if (levelFilter !== 'all' && levelFilter !== 'unmapped' && mapping.level !== levelFilter) {
          return;
        }

        // Color coding by mastery level
        let strokeColor = '#6366f1'; // Indigo default
        let strokeWidth = 2.5;
        let strokeDasharray: string | undefined = undefined;

        if (mapping.level === 'Introduced') {
          strokeColor = '#0284c7'; // Sky Blue
          strokeWidth = 2;
          strokeDasharray = '5 4';
        } else if (mapping.level === 'Reinforced') {
          strokeColor = '#6366f1'; // Indigo
          strokeWidth = 2.5;
        } else if (mapping.level === 'Mastered') {
          strokeColor = '#059669'; // Emerald
          strokeWidth = 3.5;
        }

        if (isSelected || isHighlighted) {
          strokeWidth += 2;
        }

        // Source and Target handles based on flowDirection & orientation
        let sourceNode = clo.id;
        let targetNode = mapping.ploId;
        let sourceHandle = 'handle-right';
        let targetHandle = 'handle-left';

        if (flowDirection === 'clo-to-plo') {
          // CLO on Left, PLO on Right
          sourceNode = clo.id;
          targetNode = mapping.ploId;
          if (orientation === 'horizontal') {
            sourceHandle = 'handle-right';
            targetHandle = 'handle-left';
          } else {
            sourceHandle = 'handle-bottom';
            targetHandle = 'handle-top';
          }
        } else {
          // PLO on Left, CLO on Right
          sourceNode = mapping.ploId;
          targetNode = clo.id;
          if (orientation === 'horizontal') {
            sourceHandle = 'handle-right';
            targetHandle = 'handle-left';
          } else {
            sourceHandle = 'handle-bottom';
            targetHandle = 'handle-top';
          }
        }

        list.push({
          id: edgeId,
          source: sourceNode,
          target: targetNode,
          sourceHandle,
          targetHandle,
          animated: mapping.level === 'Mastered',
          style: {
            stroke: strokeColor,
            strokeWidth,
            strokeDasharray,
            opacity: isDimmed ? 0.12 : 1,
            cursor: 'pointer',
          },
          label: `${mapping.level.charAt(0)}`,
          labelStyle: {
            fontSize: 11,
            fontWeight: 800,
            fill: strokeColor,
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.96,
            stroke: strokeColor,
            strokeWidth: 1.5,
            rx: 6,
            ry: 6,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 16,
            height: 16,
          },
          data: {
            cloId: clo.id,
            ploId: mapping.ploId,
            level: mapping.level,
            rationale: mapping.rationale,
          },
        });
      });
    });

    return list;
  }, [clos, orientation, flowDirection, selectedEdgeId, connectedIds, levelFilter]);

  // Selected edge object lookup for detail panel
  const activeEdgeData = useMemo(() => {
    if (!selectedEdgeId) return null;
    const parts = selectedEdgeId.replace('edge-', '').split('-');
    if (parts.length < 2) return null;
    const cloId = parts[0];
    const ploId = parts[1];
    const clo = clos.find((c) => c.id === cloId);
    const plo = plos.find((p) => p.id === ploId);
    const map = (clo?.mappedPLOs || []).find((m) => m.ploId === ploId);

    if (!clo || !plo || !map) return null;

    return {
      edgeId: selectedEdgeId,
      clo,
      plo,
      mapping: map,
    };
  }, [selectedEdgeId, clos, plos]);

  // Handle Edge Click
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  // Handle Node Click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
    setSelectedEdgeId(null);
  }, []);

  // Handle Canvas Background Click
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  // Handle Edge Update
  const handleUpdateMappingLevel = (cloId: string, ploId: string, level: MappingLevel) => {
    const updatedCLOs = clos.map((c) => {
      if (c.id === cloId) {
        const mappings = (c.mappedPLOs || []).map((m) =>
          m.ploId === ploId ? { ...m, level } : m
        );
        return { ...c, mappedPLOs: mappings };
      }
      return c;
    });
    onUpdateCourse({ ...course, clos: updatedCLOs });
  };

  const handleUpdateRationale = (cloId: string, ploId: string, rationale: string) => {
    const updatedCLOs = clos.map((c) => {
      if (c.id === cloId) {
        const mappings = (c.mappedPLOs || []).map((m) =>
          m.ploId === ploId ? { ...m, rationale } : m
        );
        return { ...c, mappedPLOs: mappings };
      }
      return c;
    });
    onUpdateCourse({ ...course, clos: updatedCLOs });
  };

  const handleDeleteMapping = (cloId: string, ploId: string) => {
    const updatedCLOs = clos.map((c) => {
      if (c.id === cloId) {
        return {
          ...c,
          mappedPLOs: (c.mappedPLOs || []).filter((m) => m.ploId !== ploId),
        };
      }
      return c;
    });
    onUpdateCourse({ ...course, clos: updatedCLOs });
    setSelectedEdgeId(null);
  };

  // Handle Interactive Connection between handles
  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      const sourceIsCLO = clos.some((c) => c.id === params.source);
      const targetIsPLO = plos.some((p) => p.id === params.target);
      const sourceIsPLO = plos.some((p) => p.id === params.source);
      const targetIsCLO = clos.some((c) => c.id === params.target);

      let cloId = '';
      let ploId = '';

      if (sourceIsCLO && targetIsPLO) {
        cloId = params.source!;
        ploId = params.target!;
      } else if (sourceIsPLO && targetIsCLO) {
        cloId = params.target!;
        ploId = params.source!;
      } else {
        return;
      }

      const clo = clos.find((c) => c.id === cloId);
      const plo = plos.find((p) => p.id === ploId);
      if (!clo || !plo) return;

      if ((clo.mappedPLOs || []).some((m) => m.ploId === ploId)) {
        return;
      }

      const defaultRationale = `Supports ${plo.code} through observable student demonstration in ${clo.code}.`;
      const newMapping = {
        ploId,
        level: 'Reinforced' as MappingLevel,
        rationale: defaultRationale,
      };

      const updatedCLOs = clos.map((c) =>
        c.id === cloId ? { ...c, mappedPLOs: [...(c.mappedPLOs || []), newMapping] } : c
      );

      onUpdateCourse({ ...course, clos: updatedCLOs });
      setSelectedEdgeId(`edge-${cloId}-${ploId}`);
    },
    [clos, plos, course, onUpdateCourse, readOnly]
  );

  // Quick connect handler
  const handleCreateQuickConnect = () => {
    if (!newConnectCLO || !newConnectPLO) return;

    const clo = clos.find((c) => c.id === newConnectCLO);
    const plo = plos.find((p) => p.id === newConnectPLO);
    if (!clo || !plo) return;

    const rationale =
      newConnectRationale.trim() ||
      `Supports ${plo.code} through demonstrable competencies assessed in ${clo.code}.`;

    let updatedMappings = [...(clo.mappedPLOs || [])];
    const existingIdx = updatedMappings.findIndex((m) => m.ploId === newConnectPLO);
    if (existingIdx >= 0) {
      updatedMappings[existingIdx] = {
        ploId: newConnectPLO,
        level: newConnectLevel,
        rationale,
      };
    } else {
      updatedMappings.push({
        ploId: newConnectPLO,
        level: newConnectLevel,
        rationale,
      });
    }

    const updatedCLOs = clos.map((c) =>
      c.id === newConnectCLO ? { ...c, mappedPLOs: updatedMappings } : c
    );

    onUpdateCourse({ ...course, clos: updatedCLOs });
    setShowQuickConnectModal(false);
    setNewConnectRationale('');
    setSelectedEdgeId(`edge-${newConnectCLO}-${newConnectPLO}`);
  };

  // Seed default PLOs if course has none
  const handleSeedDefaultPLOs = () => {
    const defaultPLOs: PLO[] = [
      {
        id: `plo-${Date.now()}-1`,
        code: 'PLO 1',
        title: 'Fundamental Discipline Knowledge',
        description: 'Demonstrate deep mastery of core theories, principles, and analytical methods.',
      },
      {
        id: `plo-${Date.now()}-2`,
        code: 'PLO 2',
        title: 'Critical Problem Analysis',
        description: 'Identify, formulate, and analyze complex domain problems reaching substantiated conclusions.',
      },
      {
        id: `plo-${Date.now()}-3`,
        code: 'PLO 3',
        title: 'Design & Applied Development',
        description: 'Design robust solutions, prototypes, or processes that meet specified accreditation standards.',
      },
      {
        id: `plo-${Date.now()}-4`,
        code: 'PLO 4',
        title: 'Professional Ethics & Societal Impact',
        description: 'Apply ethical principles and commit to professional responsibilities and sustainability.',
      },
    ];

    onUpdateCourse({ ...course, plos: defaultPLOs });
  };

  // Metrics
  const totalMappings = clos.reduce((acc, c) => acc + (c.mappedPLOs || []).length, 0);
  const coveredPLOsCount = plos.filter((p) =>
    clos.some((c) => (c.mappedPLOs || []).some((m) => m.ploId === p.id))
  ).length;
  const mappedCLOsCount = clos.filter((c) => (c.mappedPLOs || []).length > 0).length;
  const coveragePercent = plos.length > 0 ? Math.round((coveredPLOsCount / plos.length) * 100) : 100;
  const unmappedCLOsCount = clos.length - mappedCLOsCount;
  const unmappedPLOsCount = plos.length - coveredPLOsCount;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col overflow-hidden shadow-xs transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-white h-screen' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Top Header / Control Toolbar */}
      <div className="p-3 sm:px-4 sm:py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Visual Outcome Dependency Graph
                </span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono">
                  ReactFlow
                </span>
              </div>
              <div className="text-[10px] text-slate-500 hidden sm:block">
                Interactive mapping between Program Outcomes (PLO) and Course Outcomes (CLO)
              </div>
            </div>
          </div>

          {/* Alignment Health Pill */}
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <span
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center space-x-1 ${
                coveragePercent === 100 && unmappedCLOsCount === 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {coveragePercent === 100 && unmappedCLOsCount === 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{coveragePercent}% PLO Coverage</span>
            </span>

            <span className="text-slate-400">•</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {coveredPLOsCount}/{plos.length} PLOs • {mappedCLOsCount}/{clos.length} CLOs • {totalMappings} Links
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Quick Search */}
          <div className="relative hidden lg:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Find outcome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded-lg">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'Introduced', label: 'I' },
                { id: 'Reinforced', label: 'R' },
                { id: 'Mastered', label: 'M' },
                { id: 'unmapped', label: 'Gaps' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setLevelFilter(filter.id)}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  levelFilter === filter.id
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Filter by ${filter.label}`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Flow Direction Toggle (CLO ➔ PLO vs PLO ➔ CLO) */}
          <button
            type="button"
            onClick={() =>
              setFlowDirection(flowDirection === 'clo-to-plo' ? 'plo-to-clo' : 'clo-to-plo')
            }
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center space-x-1"
            title="Toggle between bottom-up accreditation rollup (CLO ➔ PLO) and top-down curriculum cascade (PLO ➔ CLO)"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">
              {flowDirection === 'clo-to-plo' ? 'Rollup (CLO ➔ PLO)' : 'Cascade (PLO ➔ CLO)'}
            </span>
            <span className="sm:hidden">
              {flowDirection === 'clo-to-plo' ? 'CLO➔PLO' : 'PLO➔CLO'}
            </span>
          </button>

          {/* Orientation Toggle */}
          <button
            type="button"
            onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title={`Switch to ${orientation === 'horizontal' ? 'Vertical (Rows)' : 'Horizontal (Columns)'} Layout`}
          >
            <Split className={`w-3.5 h-3.5 ${orientation === 'vertical' ? 'rotate-90' : ''}`} />
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                if (clos.length > 0) setNewConnectCLO(clos[0].id);
                if (plos.length > 0) setNewConnectPLO(plos[0].id);
                setShowQuickConnectModal(true);
              }}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer shadow-xs"
              title="Add a new dependency link between CLO and PLO"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}

          {onAskCopilot && (
            <button
              type="button"
              onClick={() =>
                onAskCopilot(
                  `Analyze this CLO-to-PLO dependency graph for "${course.title}". Current state: ${coveredPLOsCount}/${plos.length} PLOs covered and ${mappedCLOsCount}/${clos.length} CLOs mapped. Suggest improvements for constructive alignment.`
                )
              }
              className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer"
              title="Ask AI Mapping Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Flow Canvas or Empty State */}
      <div className="flex-1 w-full relative bg-slate-50">
        {plos.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                No Program Learning Outcomes (PLOs) Defined
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                To build the visual dependency graph, define program outcomes for{' '}
                <strong>{course.programme || 'the degree programme'}</strong>.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleSeedDefaultPLOs}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Seed Standard Accreditation PLOs</span>
              </button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onConnect={onConnect}
            fitView
            attributionPosition="bottom-right"
            minZoom={0.25}
            maxZoom={1.75}
          >
            <Background color="#cbd5e1" gap={20} size={1} />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              nodeColor={(node) => (node.type === 'ploNode' ? '#3b82f6' : '#6366f1')}
              maskColor="rgba(241, 245, 249, 0.7)"
              position="bottom-right"
              className="!w-36 !h-24 !rounded-xl !border-slate-300 shadow-sm"
            />

            {/* Legend Panel */}
            <Panel
              position="top-left"
              className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-xs text-xs space-y-2 max-w-xs sm:max-w-sm"
            >
              <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wide flex items-center justify-between">
                <span>Alignment Legend</span>
                {selectedNodeId && (
                  <span className="text-[10px] text-indigo-600 font-bold ml-2">
                    Focus Active
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-700 font-medium">Program Outcome (PLO)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-slate-700 font-medium">Course Outcome (CLO)</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-[10px] pt-1.5 border-t border-slate-100 text-slate-600 font-medium">
                <span className="flex items-center space-x-1">
                  <span className="w-3.5 h-0.5 border-t-2 border-dashed border-sky-500 inline-block" />
                  <span>Introduced (I)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3.5 h-0.5 bg-indigo-500 inline-block" />
                  <span>Reinforced (R)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3.5 h-1 bg-emerald-600 inline-block" />
                  <span>Mastered (M)</span>
                </span>
              </div>
              {selectedNodeId && (
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(null)}
                  className="w-full text-center text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold pt-1 border-t border-slate-100 cursor-pointer"
                >
                  Clear Node Focus
                </button>
              )}
            </Panel>

            {/* Quick Tip Panel */}
            {!readOnly && (
              <Panel
                position="top-right"
                className="hidden md:block bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-[11px] text-slate-500"
              >
                💡 Drag from any handle to connect • Click an edge to edit rationale
              </Panel>
            )}
          </ReactFlow>
        )}

        {/* Selected Edge Inspector Drawer */}
        {activeEdgeData && (
          <div className="absolute top-3 right-3 z-20 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900">
                  Alignment: {activeEdgeData.clo.code} ➔ {activeEdgeData.plo.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEdgeId(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>

            {/* Level Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Contribution Level (I / R / M)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Introduced', 'Reinforced', 'Mastered'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      handleUpdateMappingLevel(
                        activeEdgeData.clo.id,
                        activeEdgeData.plo.id,
                        lvl
                      )
                    }
                    className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                      activeEdgeData.mapping.level === lvl
                        ? lvl === 'Mastered'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : lvl === 'Reinforced'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Outcome Details */}
            <div className="space-y-1 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <p className="text-[11px] text-slate-700 leading-snug">
                <strong className="text-slate-900">{activeEdgeData.clo.code}:</strong> "{activeEdgeData.clo.statement}"
              </p>
              <p className="text-[11px] text-slate-700 leading-snug pt-1 border-t border-slate-200">
                <strong className="text-slate-900">{activeEdgeData.plo.code}:</strong> {activeEdgeData.plo.title}
              </p>
            </div>

            {/* Accreditation Rationale */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Accreditation Rationale
              </label>
              <textarea
                rows={3}
                disabled={readOnly}
                value={activeEdgeData.mapping.rationale || ''}
                onChange={(e) =>
                  handleUpdateRationale(
                    activeEdgeData.clo.id,
                    activeEdgeData.plo.id,
                    e.target.value
                  )
                }
                placeholder="Explain how this CLO equips learners with competencies mandated by this PLO..."
                className="w-full p-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            {/* Footer Buttons */}
            {!readOnly && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteMapping(activeEdgeData.clo.id, activeEdgeData.plo.id)
                  }
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEdgeId(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save & Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* Selected Node Summary Drawer if a node is clicked */}
        {selectedNodeId && !selectedEdgeId && (() => {
          const selectedCLO = clos.find((c) => c.id === selectedNodeId);
          const selectedPLO = plos.find((p) => p.id === selectedNodeId);

          if (!selectedCLO && !selectedPLO) return null;

          return (
            <div className="absolute bottom-3 left-3 z-20 max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">
                    {selectedCLO ? selectedCLO.code : selectedPLO?.code} Path Inspection
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    Isolated Graph
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                >
                  Reset Focus
                </button>
              </div>

              {selectedCLO ? (
                <div className="text-xs space-y-1.5">
                  <p className="text-slate-700 italic font-medium leading-relaxed">
                    "{selectedCLO.statement}"
                  </p>
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong>Contributes to {(selectedCLO.mappedPLOs || []).length} PLO(s):</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selectedCLO.mappedPLOs || []).length === 0 ? (
                        <span className="text-rose-600 font-semibold">Zero mappings (Orphan CLO)</span>
                      ) : (
                        (selectedCLO.mappedPLOs || []).map((m) => {
                          const p = plos.find((plo) => plo.id === m.ploId);
                          return (
                            <span
                              key={m.ploId}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-800"
                            >
                              {p?.code || 'PLO'} ({m.level.charAt(0)})
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs space-y-1.5">
                  <p className="text-slate-800 font-bold">{selectedPLO?.title}</p>
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong>Addressed by {
                      clos.filter((c) =>
                        (c.mappedPLOs || []).some((m) => m.ploId === selectedPLO?.id)
                      ).length
                    } course outcome(s):</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {clos.filter((c) =>
                        (c.mappedPLOs || []).some((m) => m.ploId === selectedPLO?.id)
                      ).length === 0 ? (
                        <span className="text-amber-600 font-semibold">Zero course outcomes address this PLO</span>
                      ) : (
                        clos
                          .filter((c) =>
                            (c.mappedPLOs || []).some((m) => m.ploId === selectedPLO?.id)
                          )
                          .map((c) => (
                            <span
                              key={c.id}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-800"
                            >
                              {c.code}
                            </span>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Quick Connect Modal */}
      {showQuickConnectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQuickConnectModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Create Curricular Mapping Link</span>
              </h3>
              <button
                onClick={() => setShowQuickConnectModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select Course Learning Outcome (CLO)
                </label>
                <select
                  value={newConnectCLO}
                  onChange={(e) => setNewConnectCLO(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                >
                  {clos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.bloomVerb || c.bloomLevel}: {c.statement.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select Program Learning Outcome (PLO)
                </label>
                <select
                  value={newConnectPLO}
                  onChange={(e) => setNewConnectPLO(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                >
                  {plos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mastery Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Introduced', 'Reinforced', 'Mastered'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewConnectLevel(lvl)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                        newConnectLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Accreditation Rationale (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newConnectRationale}
                  onChange={(e) => setNewConnectRationale(e.target.value)}
                  placeholder="Explain why this outcome directly advances the programme outcome..."
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuickConnectModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateQuickConnect}
                disabled={!newConnectCLO || !newConnectPLO}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                Add Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const OutcomeDependencyGraph: React.FC<OutcomeDependencyGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <OutcomeDependencyGraphInner {...props} />
    </ReactFlowProvider>
  );
};
