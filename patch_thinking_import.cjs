const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('import { GoogleGenAI } from "@google/genai";', 'import { GoogleGenAI, ThinkingLevel } from "@google/genai";');
code = code.replace("enhancedConfig.thinkingConfig = { thinkingLevel: 'HIGH' };", "enhancedConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };");

fs.writeFileSync('server.ts', code);
console.log("Patched thinking level import");
