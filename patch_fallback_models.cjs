const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/modelsToTry = \["gemini-3\.1-flash-lite"\];/g, 'modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-flash"];');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts modelsToTry with array of fallbacks");
