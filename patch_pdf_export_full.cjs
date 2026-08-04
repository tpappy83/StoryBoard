const fs = require('fs');

const code = `import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectMetadata, Scene, Character } from '../types';

export interface PDFExportData {
  project: ProjectMetadata;
  scenes?: Scene[];
  characters?: Character[];
}

export const generateProjectPDF = (data: PDFExportData) => {
  const { project, scenes = [], characters = [] } = data;
  
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let y = 20;
  const margin = 20;

  const checkPage = (height = 10) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // 1. Project Overview
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const title = project.title || 'Untitled Project';
  doc.text(title, margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(\`Project ID: \${project.id || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Created Date: \${project.createdAt || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Last Updated Date: \${project.updatedAt || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Last Sync Date: \${project.lastSync || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Number of Scenes: \${scenes.length}\`, margin, y); y += 6;
  doc.text(\`Number of Characters: \${characters.length}\`, margin, y); y += 6;
  if (project.episodeId) {
    doc.text(\`Episode ID: \${project.episodeId}\`, margin, y); y += 6;
  }
  
  // 2. Complete Scene Summary Section
  doc.addPage();
  y = margin;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Scene Index', margin, y);
  y += 10;

  const sceneIndexData = scenes.map((s, idx) => [
    (s.order ?? idx + 1).toString(),
    s.id,
    s.title,
    s.purpose || '',
    s.updatedAt || 'N/A',
    s.createdAt || 'N/A'
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Order', 'Scene ID', 'Title', 'Summary', 'Last Updated', 'Created At']],
    body: sceneIndexData,
    theme: 'grid',
    headStyles: { fillColor: [10, 42, 67] },
    margin: { left: margin, right: margin }
  });
  
  y = (doc).lastAutoTable.finalY + 15;

  // 3. Full Scene Contents Section
  doc.addPage();
  y = margin;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Full Scene Contents', margin, y);
  y += 10;

  scenes.forEach((s, index) => {
    checkPage(30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 42, 67);
    doc.text(\`Scene \${s.order ?? index + 1}: \${s.title}\`, margin, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(\`Scene ID: \${s.id}\`, margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const content = s.fullContent || s.prose || 'No content provided.';
    const proseLines = doc.splitTextToSize(\`Content: \${content}\`, doc.internal.pageSize.width - margin * 2);
    checkPage(proseLines.length * 5 + 5);
    doc.text(proseLines, margin, y);
    y += proseLines.length * 5 + 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text(\`Character References: \${s.charactersReferenced ? s.charactersReferenced.join(', ') : (s.participantIds ? s.participantIds.join(', ') : 'None')}\`, margin, y);
    y += 6;
    
    doc.text(\`Scene Notes: \${s.notes || 'None'}\`, margin, y);
    y += 6;
    
    doc.text(\`Revision History: N/A\`, margin, y);
    y += 10;
    
    if (y < pageHeight - margin) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, y, doc.internal.pageSize.width - margin, y);
      y += 10;
    }
  });

  // 4. Character Directory
  doc.addPage();
  y = margin;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Character Directory', margin, y);
  y += 10;

  characters.forEach(c => {
    checkPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(\`\${c.name} (\${c.role})\`, margin, y);
    y += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(\`Character ID: \${c.id}\`, margin, y);
    y += 6;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    doc.text(\`Demographics: Age: \${c.demographics?.age || 'N/A'} | Gender: \${c.demographics?.gender || 'N/A'} | Ethnicity: \${c.demographics?.ethnicity || 'N/A'}\`, margin, y);
    y += 6;
    
    const summaryLines = doc.splitTextToSize(\`Summary: \${c.summary || c.goals || 'None'}\`, doc.internal.pageSize.width - margin * 2);
    checkPage(summaryLines.length * 5 + 5);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5;
    
    const notesLines = doc.splitTextToSize(\`Notes: \${c.notes || 'None'}\`, doc.internal.pageSize.width - margin * 2);
    checkPage(notesLines.length * 5 + 5);
    doc.text(notesLines, margin, y);
    y += notesLines.length * 5;
    
    doc.text(\`First Appearance: \${c.firstAppearanceSceneId || 'Unknown'}\`, margin, y);
    y += 6;
    doc.text(\`Last Updated: \${c.updatedAt || 'N/A'}\`, margin, y);
    y += 10;
  });

  // 5. Metadata Section
  doc.addPage();
  y = margin;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Metadata Section', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(\`Project ID: \${project.id || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Episode ID: \${project.episodeId || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Current Scene ID: \${project.currentSceneId || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Current Character ID: \${project.currentCharacterId || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Auto-Save Enabled: \${project.autoSaveEnabled ? 'Yes' : 'No'}\`, margin, y); y += 6;
  doc.text(\`Auto-Sync Enabled: \${project.autoSyncEnabled ? 'Yes' : 'No'}\`, margin, y); y += 6;

  doc.save(\`\${project.title ? project.title.replace(/\\s+/g, '_') : 'Project'}_Export.pdf\`);
};
`;

fs.writeFileSync('src/lib/pdfExportService.ts', code);
console.log("Rewritten pdfExportService.ts for all fields");
