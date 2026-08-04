const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const renamingInstruction = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Character, Scene, and Demographic Renaming Enabled:
You must allow the user to rename characters, scene titles, and demographic attributes at any time.
Whenever the user provides a new name, title, or demographic change, you must immediately update all future outputs to reflect the new information.
Capabilities to Enable:
- Users can rename any character (e.g., protagonist, antagonist, side characters).
- Users can rename any scene title or request new ones.
- Users can modify demographics, including: age, gender, ethnicity, occupation, relationship roles, personality traits, backstory elements.
Behavior Requirements:
- Always confirm the change and apply it globally in all future responses.
- Never revert to old names or demographics unless the user explicitly asks.
- If a user renames multiple elements at once, update all of them consistently.
- If a user asks for a list of current names, scenes, or demographics, provide the updated set.
- If a user introduces a new character or scene, incorporate it seamlessly.
- Maintain narrative continuity after changes unless the user requests a reset.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

// Replace in Live API
code = code.replace(
  'systemInstruction: "You are the Live Narrative State Engine and voice-based Writer\'s Room consultant. Discuss the story, characters, and plot threads with the author.",',
  'systemInstruction: "You are the Live Narrative State Engine and voice-based Writer\'s Room consultant. Discuss the story, characters, and plot threads with the author.\\n\\n" + `' + renamingInstruction.replace(/\n/g, '\\n') + '`,'
);

// Add to /api/chat systemInstruction
code = code.replace(
  'Maintain a living, self‑consistent story universe where every update — small or catastrophic — instantly reshapes the narrative fabric with no contradictions.`;',
  'Maintain a living, self‑consistent story universe where every update — small or catastrophic — instantly reshapes the narrative fabric with no contradictions.\\n" + `' + renamingInstruction.replace(/\n/g, '\\n') + '`;'
);

// Add to generateContentWithFallback originalityPrompt
code = code.replace(
  'let originalityPrompt = `\\n\\n[SYSTEM DIRECTIVE: GENERATE 100% ORIGINAL, NOVEL, AND DISTINCT CONTEXT. DO NOT REPEAT PAST OUTPUTS. RANDOM SEED: ${seed}]\\n[CRITICAL DIRECTIVE: YOU MUST GENERATE AT LEAST 700 WORDS OF HIGHLY DETAILED, EXPANSIVE, AND IMMERSIVE TEXT. DO NOT SUMMARIZE OR ABBREVIATE.]\\n[FULL APP STATE CONTEXT: ${fullContext}]`;',
  'let originalityPrompt = `\\n\\n[SYSTEM DIRECTIVE: GENERATE 100% ORIGINAL, NOVEL, AND DISTINCT CONTEXT. DO NOT REPEAT PAST OUTPUTS. RANDOM SEED: ${seed}]\\n[CRITICAL DIRECTIVE: YOU MUST GENERATE AT LEAST 700 WORDS OF HIGHLY DETAILED, EXPANSIVE, AND IMMERSIVE TEXT. DO NOT SUMMARIZE OR ABBREVIATE.]\\n[FULL APP STATE CONTEXT: ${fullContext}]\\n' + renamingInstruction.replace(/\n/g, '\\n') + '`;'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with renaming instructions");
