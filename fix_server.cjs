const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix Live API syntax error
code = code.replace(
  '\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n" + `\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\nSystem Instruction:',
  '\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\nSystem Instruction:'
);

// Check if /api/chat has a similar error
code = code.replace(
  'Maintain a living, self‑consistent story universe where every update — small or catastrophic — instantly reshapes the narrative fabric with no contradictions.\\n" + `\\n',
  'Maintain a living, self‑consistent story universe where every update — small or catastrophic — instantly reshapes the narrative fabric with no contradictions.\\n\\n'
);

code = code.replace(
  'Maintain a living, self‑consistent story universe where every update — small or catastrophic — instantly reshapes the narrative fabric with no contradictions.\\n" + `\\n',
  'Maintain a living, self‑consistent story universe where every update — small or catastrophic — instantly reshapes the narrative fabric with no contradictions.\\n\\n'
);

// Just fix /api/chat systemInstruction specifically
code = code.replace(
  '\\n" + `\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\nSystem Instruction:',
  '\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\nSystem Instruction:'
);
code = code.replace(
  '\\n` + `\\n',
  '\\n'
);

fs.writeFileSync('server.ts', code);
console.log("Fixed syntax error");
