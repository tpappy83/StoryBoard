const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Update propose-scene
content = content.replace(
  /- prose: Rich narrative prose \(150-250 words\)/g,
  "- prose: Rich narrative prose (AT LEAST 700 WORDS, highly detailed, expansive and immersive)"
);

// 2. Update writers-room
content = content.replace(
  /- "assessment": string \(Deep, specific evaluation of the story\/scene\)/g,
  "- \"assessment\": string (Deep, specific evaluation of the story/scene. You MUST provide an expansive, deeply detailed analysis of AT LEAST 700 WORDS for THIS agent's assessment.)"
);
content = content.replace(
  /Generate specialized agent feedback from 5 board members:/g,
  "Generate specialized agent feedback from 5 board members. EACH board member MUST provide a highly detailed, expansive assessment of AT LEAST 700 WORDS:"
);

// 3. Update writers-room-apply
content = content.replace(
  /- "revisedProse": string \(the fully updated scene prose\)/g,
  "- \"revisedProse\": string (the fully updated scene prose, MUST BE AT LEAST 700 WORDS of rich, immersive detail)"
);
content = content.replace(
  /Apply this directive to the prose\./g,
  "Apply this directive to the prose. Expand upon the scene, ensuring the revised prose is highly detailed and AT LEAST 700 WORDS."
);

// 4. Update offscreen-simulate
content = content.replace(
  /- "simulatedProseOutline": string \(A detailed prose narrative of the event\)/g,
  "- \"simulatedProseOutline\": string (A deeply detailed prose narrative of the event, AT LEAST 700 WORDS)"
);

// 5. Update multi-pass-revision
content = content.replace(
  /Revise the prose section according to the specified pass focus\./g,
  "Revise the prose section according to the specified pass focus. Expand and enrich the text to ensure the output is AT LEAST 700 WORDS of high-quality narrative."
);

// 6. Update plot-evolution
content = content.replace(
  /- proposedProseOutline \(string\)/g,
  "- proposedProseOutline (string, MUST BE AT LEAST 700 WORDS)"
);

// 7. Update generate-scene
content = content.replace(
  /\$\{prompt\}/,
  "${prompt}\n\nCRITICAL DIRECTIVE: You MUST generate AT LEAST 700 WORDS of highly detailed, expansive, and immersive narrative prose. Do not summarize or abbreviate."
);

// 8. Update fallback config to support larger output and ensure originality
content = content.replace(
  /const enhancedConfig = \{([\s\S]*?)temperature: config\.temperature \? Math\.max\(config\.temperature, 0\.9\) : 0\.9,([\s\S]*?)\};/,
  "const enhancedConfig = {$1temperature: config.temperature ? Math.max(config.temperature, 0.95) : 0.95,$2maxOutputTokens: config.maxOutputTokens || 8192\n  };"
);

// 9. For writers-room specifically, we already removed fallback, let's just make sure it's robust.

fs.writeFileSync(path, content);
console.log('Prompts hardened.');
