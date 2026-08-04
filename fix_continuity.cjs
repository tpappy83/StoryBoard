const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /- violationsFound: Array of detailed violations\./g,
  "- violationsFound: Array of detailed violations. EACH violation MUST BE highly expansive and AT LEAST 700 WORDS of deep diagnostic analysis."
);

fs.writeFileSync(path, content);
