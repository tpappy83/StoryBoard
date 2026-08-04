const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace standard generateContentWithFallback calls
code = code.replace(/app\.post\("\/api\/gemini\/validate-continuity", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'thinking');`));

code = code.replace(/app\.post\("\/api\/gemini\/character-synthesis", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'thinking');`));

code = code.replace(/app\.post\("\/api\/gemini\/memory-recall", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'fast');`));

code = code.replace(/app\.post\("\/api\/gemini\/writers-room", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'thinking');`));

code = code.replace(/app\.post\("\/api\/gemini\/writers-room-apply", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'complex');`));

code = code.replace(/app\.post\("\/api\/gemini\/offscreen-simulate", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'thinking');`));

code = code.replace(/app\.post\("\/api\/gemini\/intersection-analysis", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'thinking');`));

code = code.replace(/app\.post\("\/api\/gemini\/simulate-state-engine", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'complex');`));

code = code.replace(/app\.post\("\/api\/multi-pass-revision", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(fullPrompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(fullPrompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(fullPrompt, {${p1}}, 2, 'complex');`));

code = code.replace(/app\.post\("\/api\/plot-evolution", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'thinking');`));

code = code.replace(/app\.post\("\/api\/generate-scene", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(fullPrompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(fullPrompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(fullPrompt, {${p1}}, 2, 'complex');`));

code = code.replace(/app\.post\("\/api\/gemini\/propose-scene", async \(req, res\) => {[\s\S]*?const response = await generateContentWithFallback\(prompt, \{([\s\S]*?)\}\);/m, (match, p1) => match.replace(/generateContentWithFallback\(prompt, \{[\s\S]*?\}\);/, `generateContentWithFallback(prompt, {${p1}}, 2, 'complex');`));

fs.writeFileSync('server.ts', code);
console.log("Replaced calls");
