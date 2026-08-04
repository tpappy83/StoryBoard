const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("res.json({ prose: responseText }, 2, 'complex');", "res.json({ prose: responseText });");

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts 2042");
