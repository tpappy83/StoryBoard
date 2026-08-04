const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /Run a full 10-point Dynamic Narrative State Engine Simulation. Produce structured JSON adhering strictly to the schema./g,
  "Run a full 10-point Dynamic Narrative State Engine Simulation. Produce structured JSON adhering strictly to the schema. CRITICAL: Provide highly detailed and expansive text for the sceneSummary and all change fields, they MUST BE EXHAUSTIVE and AT LEAST 700 WORDS where applicable."
);

fs.writeFileSync(path, content);
