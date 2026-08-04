const fs = require('fs');
const path = './src/components/writingStudio/WritingStudioWindow.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\/\/ Generate synthetic high quality fallback response[\s\S]*?setAiToolState\(toolName, fallbackOutput, false\);/g,
  "setAiToolState(toolName, `[ERROR] AI Generation Failed: ${err.message}`, false);"
);

fs.writeFileSync(path, content);
