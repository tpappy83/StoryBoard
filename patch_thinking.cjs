const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("enhancedConfig.thinkingConfig = { thinkingBudgetTokens: 8192 };", "enhancedConfig.thinkingConfig = { thinkingLevel: 'HIGH' };");

fs.writeFileSync('server.ts', code);
console.log("Patched thinking config");
