import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { MicroLearningUnit, ModularLearningOutcome } from '../../types/mlu';

interface MLUExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mlus: MicroLearningUnit[];
  mlos: ModularLearningOutcome[];
  courseTitle: string;
}

export const MLUExportModal: React.FC<MLUExportModalProps> = ({ isOpen, onClose, mlus, mlos, courseTitle }) => {
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');

  if (!isOpen) return null;

  const handleExport = async () => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(courseTitle, 14, 20);
      doc.setFontSize(12);
      doc.text('Weekly Lesson Plans (OBE Compliant)', 14, 30);

      const tableData = mlus.map(mlu => [
        `Week ${mlu.weekNumber}`,
        mlu.title,
        mlu.deliveryFormat || 'N/A',
        mlu.mloIds.map(id => mlos.find(mlo => mlo.id === id)?.code || '').join(', ')
      ]);

      autoTable(doc, {
        head: [['Week', 'Unit Title', 'Delivery Format', 'MLO Alignment']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save(`${courseTitle.replace(/\s+/g, '_')}_MLU_Export.pdf`);
    } else {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: courseTitle, heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: 'Weekly Lesson Plans (OBE Compliant)', heading: HeadingLevel.HEADING_2 }),
            ...mlus.map(mlu => new Paragraph({
              children: [
                new TextRun({ text: `Week ${mlu.weekNumber}: ${mlu.title}`, bold: true }),
                new TextRun({ text: `\nFormat: ${mlu.deliveryFormat}\nMLOs: ${mlu.mloIds.map(id => mlos.find(mlo => mlo.id === id)?.code || '').join(', ')}`, break: 1 })
              ]
            }))
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${courseTitle.replace(/\s+/g, '_')}_MLU_Export.docx`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Export Weekly Lesson Plans</h2>
        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-2">
            <input type="radio" checked={format === 'pdf'} onChange={() => setFormat('pdf')} />
            PDF Export (Structured)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={format === 'docx'} onChange={() => setFormat('docx')} />
            DOCX Export (Editable)
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
          <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded">Export</button>
        </div>
      </div>
    </div>
  );
};
