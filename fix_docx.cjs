const fs = require('fs');

// Fix docxExportService.ts
let docxCode = fs.readFileSync('src/lib/docxExportService.ts', 'utf8');

// Fix PageBreak
docxCode = docxCode.replace(/new PageBreak\(\)/g, "new Paragraph({ children: [new PageBreak()] })");

// Fix TableCell bold text
docxCode = docxCode.replace(/new Paragraph\(\{ text: "Order", bold: true \}\)/g, 'new Paragraph({ children: [new TextRun({ text: "Order", bold: true })] })');
docxCode = docxCode.replace(/new Paragraph\(\{ text: "Scene Title", bold: true \}\)/g, 'new Paragraph({ children: [new TextRun({ text: "Scene Title", bold: true })] })');
docxCode = docxCode.replace(/new Paragraph\(\{ text: "Scene ID", bold: true \}\)/g, 'new Paragraph({ children: [new TextRun({ text: "Scene ID", bold: true })] })');
docxCode = docxCode.replace(/new Paragraph\(\{ text: "Summary", bold: true \}\)/g, 'new Paragraph({ children: [new TextRun({ text: "Summary", bold: true })] })');

// Fix text runs in cells
docxCode = docxCode.replace(/new Paragraph\(\(s\.order \?\? index \+ 1\)\.toString\(\)\)/g, 'new Paragraph({ text: (s.order ?? index + 1).toString() })');
docxCode = docxCode.replace(/new Paragraph\(s\.title\)/g, 'new Paragraph({ text: s.title })');
docxCode = docxCode.replace(/new Paragraph\(s\.id\)/g, 'new Paragraph({ text: s.id })');
docxCode = docxCode.replace(/new Paragraph\(s\.purpose \|\| ''\)/g, 'new Paragraph({ text: s.purpose || "" })');

fs.writeFileSync('src/lib/docxExportService.ts', docxCode);


// Fix pdfExportService.ts
let pdfCode = fs.readFileSync('src/lib/pdfExportService.ts', 'utf8');
pdfCode = pdfCode.replace(/y = \(doc\)\.lastAutoTable\.finalY \+ 15;/g, "y = (doc as any).lastAutoTable.finalY + 15;");
fs.writeFileSync('src/lib/pdfExportService.ts', pdfCode);

console.log("Fixed export services");
