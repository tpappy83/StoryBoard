const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function generateContentWithFallback(contents: any, config: any = {}, retries = 2): Promise<any> {
  const seed = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const originalityPrompt = \`\\n\\n[SYSTEM DIRECTIVE: GENERATE 100% ORIGINAL, NOVEL, AND DISTINCT CONTEXT. DO NOT REPEAT PAST OUTPUTS. RANDOM SEED: \${seed}]\`;
   
  let modifiedContents = contents;
  if (typeof contents === 'string') {
    modifiedContents = contents + originalityPrompt;
  } else if (Array.isArray(contents)) {
    modifiedContents = [...contents];
    const last = modifiedContents[modifiedContents.length - 1];
    if (typeof last === 'string') {
      modifiedContents[modifiedContents.length - 1] = last + originalityPrompt;
    }
  }

  const enhancedConfig = {
    ...config,
    temperature: config.temperature ? Math.max(config.temperature, 0.95) : 0.95,
    maxOutputTokens: config.maxOutputTokens || 8192
  };

  const modelsToTry = ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
  let lastError: any = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const model of modelsToTry) {
      let finalConfig = { ...enhancedConfig };
      if (!model.includes('thinking')) {
        delete finalConfig.thinkingConfig;
      }
      try {
        const response = await ai.models.generateContent({
          model,
          contents: modifiedContents,
          config: finalConfig
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);
        if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
          console.warn(\`[Gemini API] Quota/Rate limit reached on \${model}. Trying next model or fallback.\`);
        } else {
          console.error(\`[Gemini API] Error on \${model}:\`, errStr);
        }
      }
    }
    if (attempt < retries) {
      console.warn(\`[Gemini API] All models failed. Waiting 5 seconds before retry \${attempt + 1}...\`);
      await delay(5000);
    }
  }
  
  throw lastError || new Error("Gemini API unavailable");
}
`;

code = code.replace(/async function generateContentWithFallback\([^]*?throw lastError \|\| new Error\("Gemini API unavailable"\);\n\}/m, replacement.trim());
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
