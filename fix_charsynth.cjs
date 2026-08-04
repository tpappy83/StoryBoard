const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /Use High Thinking reasoning to generate deep psychological insights, arc transformation milestones, and potential relationship flashpoints\./g,
  "Use High Thinking reasoning to generate deep psychological insights, arc transformation milestones, and potential relationship flashpoints. CRITICAL DIRECTIVE: You MUST generate highly expansive, exhaustive, and detailed text for these fields. The 'internalConflict' field MUST be AT LEAST 700 WORDS."
);

fs.writeFileSync(path, content);
