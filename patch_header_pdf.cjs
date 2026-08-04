const fs = require('fs');
let code = fs.readFileSync('src/components/HeaderTransport.tsx', 'utf8');

// Add scenes to interface
code = code.replace(
  'interface HeaderTransportProps {\n  scene?: Scene;',
  'interface HeaderTransportProps {\n  scenes?: Scene[];\n  scene?: Scene;'
);

// Add scenes to destructuring
code = code.replace(
  '  onToggleNavigator\n}) => {',
  '  onToggleNavigator,\n  scenes\n}) => {'
);
if (!code.includes('scenes\n}) => {')) {
  // Try another way
  code = code.replace(
    '  onToggleNavigator\n}) => {',
    '  onToggleNavigator,\n  scenes\n}) => {'
  );
}

const jsPDFCode = `
  const handleExportPDF = async () => {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const doc = new jsPDF();
      let y = 20;
      const margin = 20;
      const pageHeight = doc.internal.pageSize.height;

      const checkPage = (height = 10) => {
        if (y + height > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(project.title || 'Untitled Project', margin, y);
      y += 10;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(project.tagline || '', margin, y);
      y += 15;
      
      doc.setFontSize(12);
      doc.text(\`Genre: \${project.genre || 'N/A'}\`, margin, y);
      y += 15;

      // Characters
      checkPage(20);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Characters', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      if (characters && characters.length > 0) {
        characters.forEach((char) => {
          checkPage(20);
          doc.setFont('helvetica', 'bold');
          doc.text(\`\${char.name} (\${char.role})\`, margin, y);
          y += 6;
          doc.setFont('helvetica', 'normal');
          doc.text(\`Age: \${char.age} | Occupation: \${char.occupation}\`, margin, y);
          y += 6;
          
          if (char.summary) {
            const summary = doc.splitTextToSize(\`Summary: \${char.summary}\`, 170);
            checkPage(summary.length * 5);
            doc.text(summary, margin, y);
            y += (summary.length * 5) + 5;
          } else {
            y += 5;
          }
        });
      } else {
        doc.text('No characters defined.', margin, y);
        y += 10;
      }

      y += 10;

      // Scenes
      checkPage(20);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Scene Outlines', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      if (scenes && scenes.length > 0) {
        scenes.forEach((s) => {
          checkPage(20);
          doc.setFont('helvetica', 'bold');
          doc.text(\`\${s.title} (\${s.setting})\`, margin, y);
          y += 6;
          doc.setFont('helvetica', 'normal');
          
          if (s.summary) {
            const summary = doc.splitTextToSize(\`Summary: \${s.summary}\`, 170);
            checkPage(summary.length * 5);
            doc.text(summary, margin, y);
            y += (summary.length * 5) + 5;
          } else {
            y += 5;
          }
        });
      } else {
        doc.text('No scenes defined.', margin, y);
        y += 10;
      }

      doc.save(\`\${project.title.replace(/\\s+/g, '_')}_Export.pdf\`);
    } catch (err) {
      console.error("Failed to export PDF", err);
      alert("Failed to export PDF.");
    }
  };
`;

code = code.replace(
  '  const getScoreColor = (score: number) => {',
  jsPDFCode + '\n  const getScoreColor = (score: number) => {'
);

const exportButton = `
        {/* Export to PDF */}
        <button
          onClick={handleExportPDF}
          className="flex items-center space-x-1.5 bg-[#000000] hover:bg-[#0A2A43] text-purple-400 border border-[#153B5C] px-2.5 py-1.5 rounded-md text-xs font-bold transition-all"
          title="Export to PDF"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">EXPORT PDF</span>
        </button>
`;

code = code.replace(
  '{/* Google Keep Notes */}',
  exportButton + '\n        {/* Google Keep Notes */}'
);

// Add Download to lucide-react imports if it's missing
if (!code.includes('Download,')) {
  code = code.replace('import {', 'import { Download,');
}

fs.writeFileSync('src/components/HeaderTransport.tsx', code);
console.log("Patched HeaderTransport.tsx with PDF export");
