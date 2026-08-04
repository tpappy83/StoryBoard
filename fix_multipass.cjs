const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

const oldTask = `TASK
Rewrite the scene text according to the pass type, using the above context.
Preserve the core narrative intent, but improve alignment with setups/payoffs, plot threads, canon, timeline, and character arcs as appropriate for this pass.
Output ONLY the revised scene text, no introductory commentary or extra formatting wrappers.`;

const newTask = `TASK
Rewrite the scene text according to the pass type, using the above context.
Preserve the core narrative intent, but improve alignment with setups/payoffs, plot threads, canon, timeline, and character arcs as appropriate for this pass.
CRITICAL DIRECTIVE: You MUST generate AT LEAST 700 WORDS of highly detailed, expansive, and immersive narrative prose for the revised scene text. Do not summarize or abbreviate.
Output ONLY the revised scene text, no introductory commentary or extra formatting wrappers.`;

content = content.replace(oldTask, newTask);
fs.writeFileSync(path, content);
