const fs = require('fs');
let code = fs.readFileSync('src/lib/pdfExportService.ts', 'utf8');

// Replace Character parsing
const charReplace = `    const charData = characters.map(char => [
      char.name,
      char.role || 'N/A',
      char.status || 'N/A',
      char.traits ? char.traits.join(', ') : 'N/A',
      char.goals || ''
    ]);`;
code = code.replace(/const charData = characters\.map\(char => \[\n\s*char\.name,\n\s*char\.role \|\| 'N\/A',\n\s*char\.age \|\| 'N\/A',\n\s*char\.occupation \|\| 'N\/A',\n\s*char\.summary \|\| ''\n\s*\]\);/, charReplace);

// Replace autoTable headers
code = code.replace(/head: \[\['Name', 'Role', 'Age', 'Occupation', 'Summary'\]\],/, "head: [['Name', 'Role', 'Status', 'Traits', 'Goals']],");

// Replace Scene parsing
const sceneReplace = `      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 42, 67);
      doc.text(\`Scene \${index + 1}: \${s.title}\`, margin, y);
      y += 7;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(\`\${s.location || 'Unknown Location'}\`, margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      if (s.purpose) {
        const summaryLines = doc.splitTextToSize(\`Purpose: \${s.purpose}\`, doc.internal.pageSize.width - margin * 2);
        checkPage(summaryLines.length * 5 + 5);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 5 + 5;
      }
      
      if (s.prose && s.prose.trim().length > 0) {
        // Just extract a small snippet if it's too long
        let proseSnippet = s.prose.trim();
        if (proseSnippet.length > 300) {
          proseSnippet = proseSnippet.substring(0, 300) + '...';
        }
        const proseLines = doc.splitTextToSize(\`Draft: \${proseSnippet}\`, doc.internal.pageSize.width - margin * 2);
        checkPage(proseLines.length * 5 + 5);
        doc.text(proseLines, margin, y);
        y += proseLines.length * 5 + 10;
      } else {
        y += 5;
      }`;
code = code.replace(/doc\.setFontSize\(14\);\n\s*doc\.setFont\('helvetica', 'bold'\);\n\s*doc\.setTextColor\(10, 42, 67\);\n\s*doc\.text\(`Scene \$\{index \+ 1\}: \$\{s\.title\}`.*\} else \{\n\s*doc\.text\('No summary available\.', margin, y\);\n\s*y \+= 10;\n\s*\}/s, sceneReplace);

fs.writeFileSync('src/lib/pdfExportService.ts', code);
console.log("Patched pdfExportService.ts");
