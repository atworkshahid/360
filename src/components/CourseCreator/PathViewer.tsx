import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Course } from '../../types';

interface PathViewerProps {
  course: Course;
}

export const PathViewer: React.FC<PathViewerProps> = ({ course }) => {
  const [selectedCLOId, setSelectedCLOId] = useState<string | null>(null);

  const clos = course.clos || [];
  const mlos = course.mlos || [];
  const activities = course.activities || [];
  const assessments = course.assessments || [];
  const rubrics = course.rubrics || [];

  const nodes: Node[] = useMemo(() => {
    const list: Node[] = [];
    
    // Determine all connected IDs
    const connectedIds = new Set<string>();
    if (selectedCLOId) {
      connectedIds.add(selectedCLOId);
      mlos.filter(mlo => mlo.linkedCLOId === selectedCLOId || mlo.mloIds?.includes(selectedCLOId)).forEach(mlo => {
        connectedIds.add(mlo.id);
        activities.filter(act => act.outcomeType === 'MLO' && act.outcomeId === mlo.id).forEach(act => connectedIds.add(act.id));
      });
      activities.filter(act => act.outcomeType === 'CLO' && act.outcomeId === selectedCLOId).forEach(act => connectedIds.add(act.id));
      assessments.filter(a => a.linkedCLOIds.includes(selectedCLOId)).forEach(a => {
        connectedIds.add(a.id);
        if (a.rubricId) connectedIds.add(a.rubricId);
      });
    }

    const isDimmed = (id: string) => selectedCLOId && !connectedIds.has(id);

    // 1. CLO Nodes
    clos.forEach((clo, idx) => {
      list.push({
        id: clo.id,
        type: 'default',
        position: { x: 50, y: idx * 80 + 50 },
        data: { label: `${clo.code}: ${clo.statement.substring(0, 20)}...` },
        style: { 
          background: selectedCLOId === clo.id ? '#6366f1' : '#ffffff',
          color: selectedCLOId === clo.id ? '#ffffff' : '#000000',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '10px',
          width: 200,
          opacity: isDimmed(clo.id) ? 0.3 : 1,
        },
      });
    });

    // 2. MLO Nodes
    mlos.forEach((mlo, idx) => {
        list.push({
          id: mlo.id,
          type: 'default',
          position: { x: 300, y: idx * 80 + 50 },
          data: { label: `MLO: ${mlo.statement.substring(0, 20)}...` },
          style: { 
            background: '#e0e7ff', 
            border: '1px solid #818cf8', 
            borderRadius: '8px', 
            padding: '10px', 
            width: 200,
            opacity: isDimmed(mlo.id) ? 0.3 : 1,
          },
        });
    });

    // 3. Assessment Nodes
    assessments.forEach((asmt, idx) => {
        list.push({
          id: asmt.id,
          type: 'default',
          position: { x: 550, y: idx * 80 + 50 },
          data: { label: `Asmt: ${asmt.name}` },
          style: { 
            background: '#dcfce7', 
            border: '1px solid #4ade80', 
            borderRadius: '8px', 
            padding: '10px', 
            width: 200,
            opacity: isDimmed(asmt.id) ? 0.3 : 1,
          },
        });
    });

    // 4. Rubric Nodes
    rubrics.forEach((rub, idx) => {
        list.push({
          id: rub.id,
          type: 'default',
          position: { x: 800, y: idx * 80 + 50 },
          data: { label: `Rubric: ${rub.title}` },
          style: { 
            background: '#fef3c7', 
            border: '1px solid #fbbf24', 
            borderRadius: '8px', 
            padding: '10px', 
            width: 200,
            opacity: isDimmed(rub.id) ? 0.3 : 1,
          },
        });
    });

    return list;
  }, [clos, mlos, activities, assessments, rubrics, selectedCLOId]);

  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];
    
    // CLO -> MLO
    mlos.forEach(mlo => {
        if (mlo.linkedCLOId) {
            list.push({
                id: `e-${mlo.linkedCLOId}-${mlo.id}`,
                source: mlo.linkedCLOId,
                target: mlo.id,
                markerEnd: { type: MarkerType.ArrowClosed },
            });
        }
    });

    // CLO/MLO -> Assessment -> Rubric
    assessments.forEach(asmt => {
        asmt.linkedCLOIds.forEach(cloId => {
            list.push({ id: `e-${cloId}-${asmt.id}`, source: cloId, target: asmt.id, markerEnd: { type: MarkerType.ArrowClosed } });
        });
        if (asmt.rubricId) {
            list.push({ id: `e-${asmt.id}-${asmt.rubricId}`, source: asmt.id, target: asmt.rubricId, markerEnd: { type: MarkerType.ArrowClosed } });
        }
    });

    return list;
  }, [selectedCLOId, mlos, assessments]);

  return (
    <div style={{ height: '500px', width: '100%', border: '1px solid #ccc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, node) => {
          if (clos.some(clo => clo.id === node.id)) {
             setSelectedCLOId(node.id === selectedCLOId ? null : node.id);
          }
        }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
