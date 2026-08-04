const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /that may require future payoff. Return a JSON object with array "detectedSetups"\./g,
  "that may require future payoff. Return a JSON object with array \"detectedSetups\". CRITICAL DIRECTIVE: The 'description' field for each setup MUST BE highly exhaustive and AT LEAST 700 WORDS of deep narrative analysis."
);

fs.writeFileSync(path, content);
