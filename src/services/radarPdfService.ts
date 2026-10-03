import { jsPDF } from 'jspdf';
import { RadarAxisData } from '../components/AlignmentAnalysis/BloomDomainRadarChart';

export function drawRadarChart(
  doc: jsPDF,
  data: RadarAxisData[],
  x: number,
  y: number,
  radius: number,
  theme: any
) {
  const numAxes = data.length;
  const angleSlice = (Math.PI * 2) / numAxes;

  // Draw Axes
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);

  data.forEach((axis, i) => {
    const angle = i * angleSlice - Math.PI / 2;
    const ax = x + radius * Math.cos(angle);
    const ay = y + radius * Math.sin(angle);
    doc.line(x, y, ax, ay);
    
    // Label
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(axis.shortLabel, ax + (ax > x ? 2 : -10), ay + (ay > y ? 5 : -2));
  });

  // Draw Polygon
  doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
  doc.setLineWidth(0.5);

  const points = data.map((d, i) => {
    const angle = i * angleSlice - Math.PI / 2;
    const r = radius * (d.actualScore / 100);
    return [x + r * Math.cos(angle), y + r * Math.sin(angle)];
  });

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    doc.line(p1[0], p1[1], p2[0], p2[1]);
  }
}
