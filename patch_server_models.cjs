const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace models in generateContentWithFallback
const newModelsLogic = `
  let modelsToTry: string[] = [];
  if (complexity === 'thinking' || complexity === 'complex') {
    modelsToTry = ["gemini-3.1-pro-preview"];
  } else if (complexity === 'fast') {
    modelsToTry = ["gemini-3.1-flash-lite"];
  } else {
    modelsToTry = ["gemini-3.5-flash"];
  }
`;

code = code.replace(/let modelsToTry: string\[\] = \["gemini-3\.5-flash-lite", "gemini-flash-lite-latest", "gemini-3\.1-flash-lite"\];/g, newModelsLogic);

// Replace thinking mode
code = code.replace(/enhancedConfig\.thinkingConfig = \{ thinkingLevel: 'HIGH' \};/, "enhancedConfig.thinkingConfig = { thinkingLevel: 'HIGH' };");


// Update /api/chat to use gemini-3.5-flash and include googleSearch and googleMaps tools
code = code.replace(
  /const response = await ai\.models\.generateContent\(\{\s*model: "gemini-3\.5-flash-lite",/,
  `const response = await ai.models.generateContent({\n        model: "gemini-3.5-flash",`
);

// Add tools to the chat config
code = code.replace(
  /systemInstruction,\s*temperature: 0\.7\s*\}/,
  `systemInstruction,
          temperature: 0.7,
          tools: [{ googleSearch: {} }, { googleMaps: {} }]
        }`
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts models and tools");
