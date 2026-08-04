const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("ThinkingLevel.HIGH", "'HIGH'");

fs.writeFileSync('server.ts', code);
console.log("Patched thinking level");
