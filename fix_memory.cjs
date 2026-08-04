const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /3\. Provide a summary synthesis of how this topic shapes current story state\./g,
  "3. Provide a summary synthesis of how this topic shapes current story state. CRITICAL: The 'summaryAnalysis' MUST BE AT LEAST 700 WORDS of extremely detailed, exhaustive lore breakdown."
);

fs.writeFileSync(path, content);
