const fs = require('fs');
let code = fs.readFileSync('src/components/HeaderTransport.tsx', 'utf8');

code = code.replace(
  "import { Scene, Character, PlotThread, CanonFact, SetupPayoffEvent, SelectedNarrativeObject } from '../types';",
  "import { Scene, Character, PlotThread, CanonFact, SetupPayoffEvent, SelectedNarrativeObject } from '../types';\nimport { generateProjectPDF } from '../lib/pdfExportService';"
);

const oldPdfFunc = /const handleExportPDF = async \(\) => \{[\s\S]*?\}\n\s*\}\n\s*\} catch \(err\) \{\n\s*console\.error\("Failed to export PDF", err\);\n\s*alert\("Failed to export PDF\."\);\n\s*\}\n\s*\};/;

const newPdfFunc = `const handleExportPDF = () => {
    try {
      generateProjectPDF({
        project,
        scenes,
        characters
      });
    } catch (err) {
      console.error("Failed to export PDF", err);
      alert("Failed to export PDF.");
    }
  };`;

code = code.replace(oldPdfFunc, newPdfFunc);

fs.writeFileSync('src/components/HeaderTransport.tsx', code);
console.log("Patched HeaderTransport");
