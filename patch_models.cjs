const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace gemini-3.1-pro-preview with gemini-3.5-flash
code = code.replace(/"gemini-3\.1-pro-preview"/g, '"gemini-3.5-flash"');

// Ensure thinking is removed from config for flash models since they don't support it
code = code.replace(/enhancedConfig\.thinkingConfig = \{ thinkingLevel: 'HIGH' \};/g, '// thinkingConfig removed for flash models');
code = code.replace(/if \(!model\.includes\('pro'\)\) \{\s*delete finalConfig\.thinkingConfig;\s*\}/g, 'delete finalConfig.thinkingConfig;');

fs.writeFileSync('server.ts', code);
console.log("Patched models in server.ts");
