const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/"gemini-3\.5-flash"/g, '"gemini-3.1-flash-lite"');
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts models");

let code2 = fs.readFileSync('src/components/AiCommandDrawer.tsx', 'utf8');
code2 = code2.replace(/gemini-3\.5-flash/g, 'gemini-3.1-flash-lite');
fs.writeFileSync('src/components/AiCommandDrawer.tsx', code2);
console.log("Patched AiCommandDrawer.tsx models");
