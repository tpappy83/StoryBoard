const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The easiest way is to modify the signature of generateContentWithFallback to default to 'thinking' and just use that.
// But the requirement says "add this hardening to all ai features", so replacing 'complex' with 'thinking', and 'general' with 'thinking' (except for simple chat? Wait, chat does not use generateContentWithFallback, it calls ai.models.generateContent directly).

// Let's modify the function signature to default to 'thinking'
code = code.replace(/complexity: 'fast' \| 'general' \| 'complex' \| 'thinking' = 'general'/, "complexity: 'fast' | 'general' | 'complex' | 'thinking' = 'thinking'");

// And remove 'complex' fallback and replace it with 'thinking'
code = code.replace(/2, 'complex'\)/g, "2, 'thinking')");

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts default to thinking");
