const fs = require('fs');
let code = fs.readFileSync('src/components/HeaderTransport.tsx', 'utf8');

const regex = /const handleExportPDF = async \(\) => \{[\s\S]*?console\.error\("Failed to export PDF", err\);\n\s*alert\("Failed to export PDF\."\);\n\s*\}\n\s*\};/;

const newFunc = `const handleExportPDF = () => {
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

if (code.match(regex)) {
  code = code.replace(regex, newFunc);
  fs.writeFileSync('src/components/HeaderTransport.tsx', code);
  console.log("Patched correctly");
} else {
  console.log("Regex failed to match");
}
