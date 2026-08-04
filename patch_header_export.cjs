const fs = require('fs');
let code = fs.readFileSync('src/components/HeaderTransport.tsx', 'utf8');

code = code.replace(
  "import { generateProjectPDF } from '../lib/pdfExportService';",
  "import { generateProjectPDF } from '../lib/pdfExportService';\nimport { generateProjectDOCX } from '../lib/docxExportService';"
);

const handleExportPDF = `  const handleExportPDF = () => {
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
  };

  const handleExportDOCX = async () => {
    try {
      await generateProjectDOCX({
        project,
        scenes,
        characters
      });
    } catch (err) {
      console.error("Failed to export DOCX", err);
      alert("Failed to export DOCX.");
    }
  };`;

const oldPdfRegex = /const handleExportPDF = \(\) => \{[\s\S]*?console\.error\("Failed to export PDF", err\);\n\s*alert\("Failed to export PDF\."\);\n\s*\}\n\s*\};/;
code = code.replace(oldPdfRegex, handleExportPDF);

const oldExportButton = /{[^}]*Export to PDF[^}]*}\s*<button[\s\S]*?EXPORT PDF<\/span>\s*<\/button>/;

const newExportDropdown = `        {/* Export Dropdown */}
        <div className="relative group">
          <button
            className="flex items-center space-x-1.5 bg-[#000000] hover:bg-[#0A2A43] text-purple-400 border border-[#153B5C] px-2.5 py-1.5 rounded-md text-xs font-bold transition-all"
            title="Export Options"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">EXPORT</span>
          </button>
          
          <div className="absolute right-0 mt-1 w-32 bg-[#000000] border border-[#153B5C] rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
            <button
              onClick={handleExportPDF}
              className="block w-full text-left px-3 py-2 text-xs text-purple-400 hover:bg-[#0A2A43] hover:text-white"
            >
              Export to PDF
            </button>
            <button
              onClick={handleExportDOCX}
              className="block w-full text-left px-3 py-2 text-xs text-purple-400 hover:bg-[#0A2A43] hover:text-white"
            >
              Export to DOCX
            </button>
          </div>
        </div>`;

code = code.replace(oldExportButton, newExportDropdown);

fs.writeFileSync('src/components/HeaderTransport.tsx', code);
console.log("Patched HeaderTransport with Export dropdown");
