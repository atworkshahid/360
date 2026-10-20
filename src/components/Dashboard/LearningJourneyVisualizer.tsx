import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Course } from '../../types';

interface LearningJourneyVisualizerProps {
  course: Course;
}

export const LearningJourneyVisualizer: React.FC<LearningJourneyVisualizerProps> = ({ course }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !course) return;

    // Prepare graph data
    const nodes = [
      { id: 'course', name: course.title, type: 'Course' },
      ...course.modules.map(m => ({ id: m.id, name: m.title, type: 'Module' })),
      ...course.lessons.map(l => ({ id: l.id, name: l.title, type: 'Lesson' })),
      ...course.clos.map(clo => ({ id: clo.id, name: clo.code, type: 'CLO' })),
      ...course.assessments.map(asmt => ({ id: asmt.id, name: asmt.name, type: 'Assessment' }))
    ];

    const links = [
      ...course.modules.map(m => ({ source: 'course', target: m.id })),
      ...course.lessons.map(l => ({ source: l.moduleId, target: l.id })),
      ...course.lessons.filter(l => l.linkedMLOId).flatMap(l => 
        (course.clos.filter(clo => clo.id === l.linkedMLOId || clo.id === (course.mlos.find(m => m.id === l.linkedMLOId)?.id))).map(clo => ({ source: l.id, target: clo.id }))
      ),
      ...course.assessments.flatMap(asmt => 
        (asmt.linkedCLOIds || []).map(cloId => ({ source: cloId, target: asmt.id }))
      )
    ];

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2);

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d: any) => d.type === 'Course' ? 15 : d.type === 'Module' ? 12 : 8)
      .attr('fill', (d: any) => 
        d.type === 'Course' ? '#312e81' : 
        d.type === 'Module' ? '#4f46e5' : 
        d.type === 'Lesson' ? '#818cf8' : 
        d.type === 'CLO' ? '#10b981' : '#f59e0b'
      );

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d: any) => d.name)
      .attr('font-size', '10px')
      .attr('x', 12)
      .attr('y', 3);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
      label
        .attr('x', (d: any) => d.x + 15)
        .attr('y', (d: any) => d.y + 4);
    });
  }, [course]);

  return <svg ref={svgRef} className="w-full h-auto bg-white rounded-xl border border-slate-200" />;
};
