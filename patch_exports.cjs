const fs = require('fs');

function patchPDF() {
  let code = fs.readFileSync('src/lib/pdfExportService.ts', 'utf8');
  
  // Add SceneProposal import
  code = code.replace(
    "import { ProjectMetadata, Scene, Character } from '../types';",
    "import { ProjectMetadata, Scene, Character, SceneProposal } from '../types';"
  );
  
  code = code.replace(
    "  scenes?: Scene[];",
    "  scenes?: Scene[];\n  proposals?: SceneProposal[];"
  );
  
  code = code.replace(
    "const { project, scenes = [], characters = [] } = data;",
    "const { project, scenes = [], characters = [], proposals = [] } = data;"
  );
  
  // Update scene rendering to include location and prose correctly
  const sceneRender = `    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(\`Scene ID: \${s.id} | Location: \${s.location || 'Unknown'}\`, margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Summary/Purpose
    if (s.purpose) {
      const purposeLines = doc.splitTextToSize(\`Summary: \${s.purpose}\`, doc.internal.pageSize.width - margin * 2);
      checkPage(purposeLines.length * 5 + 5);
      doc.text(purposeLines, margin, y);
      y += purposeLines.length * 5 + 5;
    }

    // Full Content
    const content = s.fullContent || s.prose || 'No content provided.';
    const proseLines = doc.splitTextToSize(\`Content: \${content}\`, doc.internal.pageSize.width - margin * 2);
    checkPage(proseLines.length * 5 + 5);
    doc.text(proseLines, margin, y);
    y += proseLines.length * 5 + 5;`;

  code = code.replace(/doc\.setFontSize\(10\);\n\s*doc\.setFont\('helvetica', 'italic'\);\n\s*doc\.setTextColor\(100, 100, 100\);\n\s*doc\.text\(`Scene ID: \$\{s\.id\}`.*\} else \{\n\s*doc\.text\('No summary available\.', margin, y\);\n\s*y \+= 10;\n\s*\}/s, sceneRender); // Wait, this regex is old.
  
  code = code.replace(/doc\.setFontSize\(10\);\n\s*doc\.setFont\('helvetica', 'italic'\);\n\s*doc\.setTextColor\(100, 100, 100\);\n\s*doc\.text\(`Scene ID: \$\{s\.id\}`, margin, y\);\n\s*y \+= 8;\n\s*doc\.setFontSize\(11\);\n\s*doc\.setFont\('helvetica', 'normal'\);\n\s*doc\.setTextColor\(0, 0, 0\);\n\s*const content = s\.fullContent \|\| s\.prose \|\| 'No content provided\.';\n\s*const proseLines = doc\.splitTextToSize\(`Content: \$\{content\}`, doc\.internal\.pageSize\.width - margin \* 2\);\n\s*checkPage\(proseLines\.length \* 5 \+ 5\);\n\s*doc\.text\(proseLines, margin, y\);\n\s*y \+= proseLines\.length \* 5 \+ 5;/s, sceneRender);
  
  // Add Proposals Section
  const proposalRender = `  // Suggested Scenes (Proposals)
  if (proposals && proposals.length > 0) {
    doc.addPage();
    y = margin;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 42, 67);
    doc.text('Suggested Scenes (Proposals)', margin, y);
    y += 10;
    
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
        const purposeLines = doc.splitTextToSize(\`Summary: \${p.purpose}\`, doc.internal.pageSize.width - margin * 2);
        checkPage(purposeLines.length * 5 + 5);
        doc.text(purposeLines, margin, y);
        y += purposeLines.length * 5 + 5;
      }
      
      if (p.prose) {
        const proseLines = doc.splitTextToSize(\`Content: \${p.prose}\`, doc.internal.pageSize.width - margin * 2);
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
        doc.line(margin, y, doc.internal.pageSize.width - margin, y);
        y += 10;
      }
    });
  }
  
  // 4. Character Directory`;
  code = code.replace("// 4. Character Directory", proposalRender);

  fs.writeFileSync('src/lib/pdfExportService.ts', code);
}

function patchDOCX() {
  let code = fs.readFileSync('src/lib/docxExportService.ts', 'utf8');
  
  // Add SceneProposal import
  code = code.replace(
    "import { ProjectMetadata, Scene, Character } from '../types';",
    "import { ProjectMetadata, Scene, Character, SceneProposal } from '../types';"
  );
  
  code = code.replace(
    "  scenes?: Scene[];",
    "  scenes?: Scene[];\n  proposals?: SceneProposal[];"
  );
  
  code = code.replace(
    "const { project, scenes = [], characters = [] } = data;",
    "const { project, scenes = [], characters = [], proposals = [] } = data;"
  );
  
  // Update scene rendering to include location and prose
  const sceneReplace = `          new Paragraph({
            children: [
              new TextRun({ text: \`ID: \${s.id} | Order: \${s.order ?? index + 1} | Location: \${s.location || 'Unknown'}\`, color: "888888", size: 20 }),
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Summary:", bold: true }),
            ]
          }),
          new Paragraph({
            text: s.purpose || 'No summary provided.'
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Content:", bold: true }),
            ]
          }),`;
  code = code.replace(/new Paragraph\(\{\n\s*children: \[\n\s*new TextRun\(\{ text: `ID: \$\{s\.id\} \| Order: \$\{s\.order \?\? index \+ 1\}`.*new Paragraph\(\{\n\s*children: \[\n\s*new TextRun\(\{ text: "Content:", bold: true \}\),\n\s*\]\n\s*\}\),/s, sceneReplace);

  // Add Proposals Section
  const proposalRender = `        // Suggested Scenes (Proposals)
        ...(proposals && proposals.length > 0 ? [
          new PageBreak(),
          new Paragraph({
            text: "Suggested Scenes (Proposals)",
            heading: HeadingLevel.HEADING_1,
          }),
          ...proposals.flatMap((p, index) => [
            new Paragraph({
              text: \`Proposal \${index + 1}: \${p.title}\`,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: \`Scene ID: \${p.sceneId} | Location: \${p.location || 'Unknown'}\`, color: "888888", size: 20 }),
              ]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "Summary:", bold: true }),
              ]
            }),
            new Paragraph({
              text: p.purpose || 'No summary provided.'
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "Content:", bold: true }),
              ]
            }),
            new Paragraph({
              text: p.prose || 'No content provided.'
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "Character References: ", bold: true }),
                new TextRun(p.participants ? p.participants.join(', ') : 'None'),
              ]
            }),
            new Paragraph({ text: "" }),
          ])
        ] : []),

        new PageBreak(),
        // 4. Character Directory`;
  code = code.replace(/new PageBreak\(\),\n\n\s*\/\/\ 4\. Character Directory/, proposalRender);

  fs.writeFileSync('src/lib/docxExportService.ts', code);
}

patchPDF();
patchDOCX();
console.log("Patched PDF and DOCX export services");
