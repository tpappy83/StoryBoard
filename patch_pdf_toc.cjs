const fs = require('fs');

let code = `import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectMetadata, Scene, Character, SceneProposal } from '../types';

export interface PDFExportData {
  project: ProjectMetadata;
  scenes?: Scene[];
  proposals?: SceneProposal[];
  characters?: Character[];
}

export const generateProjectPDF = (data: PDFExportData) => {
  const { project, scenes = [], characters = [], proposals = [] } = data;
  
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  let y = 20;
  const margin = 20;
  let currentPage = 1;

  const addPage = () => {
    doc.addPage();
    currentPage++;
    y = margin;
  };

  const checkPage = (height = 10) => {
    if (y + height > pageHeight - margin) {
      addPage();
    }
  };

  const toc: { title: string, page: number }[] = [];

  // 1. Project Overview (Page 1)
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
  
  // Reserve Page 2 for Table of Contents
  addPage();
  const tocPage = currentPage;

  // 2. Complete Scene Summary Section
  addPage();
  toc.push({ title: 'Scene Index', page: currentPage });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 42, 67);
  
  // Distinct Header
  doc.setFillColor(240, 245, 250);
  doc.rect(margin, y - 6, pageWidth - margin * 2, 14, 'F');
  doc.text('Scene Index', margin + 2, y + 4);
  y += 16;
  doc.setTextColor(0, 0, 0);

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
  
  y = (doc as any).lastAutoTable.finalY + 15;

  // 3. Full Scene Contents Section
  addPage();
  toc.push({ title: 'Full Scene Contents', page: currentPage });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 42, 67);
  
  // Distinct Header
  doc.setFillColor(240, 245, 250);
  doc.rect(margin, y - 6, pageWidth - margin * 2, 14, 'F');
  doc.text('Full Scene Contents', margin + 2, y + 4);
  y += 16;
  doc.setTextColor(0, 0, 0);

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
    doc.text(\`Scene ID: \${s.id} | Location: \${s.location || 'Unknown'}\`, margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    if (s.purpose) {
      const purposeLines = doc.splitTextToSize(\`Summary: \${s.purpose}\`, pageWidth - margin * 2);
      checkPage(purposeLines.length * 5 + 5);
      doc.text(purposeLines, margin, y);
      y += purposeLines.length * 5 + 5;
    }

    const content = s.fullContent || s.prose || 'No content provided.';
    const proseLines = doc.splitTextToSize(\`Content: \${content}\`, pageWidth - margin * 2);
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
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
    }
  });
  
  if (proposals && proposals.length > 0) {
    addPage();
    toc.push({ title: 'Suggested Scenes (Proposals)', page: currentPage });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 42, 67);
    doc.setFillColor(240, 245, 250);
    doc.rect(margin, y - 6, pageWidth - margin * 2, 14, 'F');
    doc.text('Suggested Scenes (Proposals)', margin + 2, y + 4);
    y += 16;
    
    proposals.forEach((p, index) => {
      checkPage(30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 42, 67);
      doc.text(\`Proposal \${index + 1}: \${p.title}\`, margin, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(\`Scene ID: \${p.sceneId} | Location: \${p.location || 'Unknown'}\`, margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      if (p.purpose) {
        const purposeLines = doc.splitTextToSize(\`Summary: \${p.purpose}\`, pageWidth - margin * 2);
        checkPage(purposeLines.length * 5 + 5);
        doc.text(purposeLines, margin, y);
        y += purposeLines.length * 5 + 5;
      }
      
      if (p.prose) {
        const proseLines = doc.splitTextToSize(\`Content: \${p.prose}\`, pageWidth - margin * 2);
        checkPage(proseLines.length * 5 + 5);
        doc.text(proseLines, margin, y);
        y += proseLines.length * 5 + 5;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(\`Character References: \${p.participants ? p.participants.join(', ') : 'None'}\`, margin, y);
      y += 10;
      
      if (y < pageHeight - margin) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      }
    });
  }
  
  // 4. Character Directory
  addPage();
  toc.push({ title: 'Character Directory', page: currentPage });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 42, 67);
  doc.setFillColor(240, 245, 250);
  doc.rect(margin, y - 6, pageWidth - margin * 2, 14, 'F');
  doc.text('Character Directory', margin + 2, y + 4);
  y += 16;
  doc.setTextColor(0, 0, 0);

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
    
    const summaryLines = doc.splitTextToSize(\`Summary: \${c.summary || c.goals || 'None'}\`, pageWidth - margin * 2);
    checkPage(summaryLines.length * 5 + 5);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5;
    
    const notesLines = doc.splitTextToSize(\`Notes: \${c.notes || 'None'}\`, pageWidth - margin * 2);
    checkPage(notesLines.length * 5 + 5);
    doc.text(notesLines, margin, y);
    y += notesLines.length * 5;
    
    doc.text(\`First Appearance: \${c.firstAppearanceSceneId || 'Unknown'}\`, margin, y);
    y += 6;
    doc.text(\`Last Updated: \${c.updatedAt || 'N/A'}\`, margin, y);
    y += 10;
  });

  // 5. Metadata Section
  addPage();
  toc.push({ title: 'Metadata Section', page: currentPage });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 42, 67);
  doc.setFillColor(240, 245, 250);
  doc.rect(margin, y - 6, pageWidth - margin * 2, 14, 'F');
  doc.text('Metadata Section', margin + 2, y + 4);
  y += 16;
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(\`Project ID: \${project.id || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Episode ID: \${project.episodeId || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Current Scene ID: \${project.currentSceneId || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Current Character ID: \${project.currentCharacterId || 'N/A'}\`, margin, y); y += 6;
  doc.text(\`Auto-Save Enabled: \${project.autoSaveEnabled ? 'Yes' : 'No'}\`, margin, y); y += 6;
  doc.text(\`Auto-Sync Enabled: \${project.autoSyncEnabled ? 'Yes' : 'No'}\`, margin, y); y += 6;

  // Render Table of Contents
  doc.setPage(tocPage);
  y = margin;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 42, 67);
  doc.text('Table of Contents', margin, y);
  y += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  toc.forEach(item => {
    doc.text(item.title, margin, y);
    doc.text(item.page.toString(), pageWidth - margin, y, { align: 'right' });
    
    // Simple dotted leader
    const textWidth = doc.getTextWidth(item.title);
    const numWidth = doc.getTextWidth(item.page.toString());
    const availableWidth = pageWidth - margin * 2 - textWidth - numWidth - 10;
    
    if (availableWidth > 0) {
      doc.setTextColor(150, 150, 150);
      const dotSpacing = 3;
      const numDots = Math.floor(availableWidth / dotSpacing);
      const startX = margin + textWidth + 5;
      
      for (let i = 0; i < numDots; i++) {
        doc.text('.', startX + (i * dotSpacing), y);
      }
      doc.setTextColor(0, 0, 0);
    }
    
    y += 10;
  });

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(\`Page \${i} of \${totalPages}\`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save(\`\${project.title ? project.title.replace(/\\s+/g, '_') : 'Project'}_Export.pdf\`);
};
`
fs.writeFileSync('src/lib/pdfExportService.ts', code);
console.log('PDF export service updated with ToC and distinct section headers');
