const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = `import { LiveVoiceChat } from './components/LiveVoiceChat';\n`;

code = code.replace(/import React[^;]+;/, match => match + "\n" + importStatement);

code = code.replace(
  'return (',
  'return (\n    <>\n      <LiveVoiceChat />'
);

code = code.replace(
  '  );\n};',
  '    </>\n  );\n};'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with LiveVoiceChat");
