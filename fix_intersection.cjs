const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /recommendedCollisionTitle \(string\), recommendedPrompt \(string\)\./g,
  "recommendedCollisionTitle (string), recommendedPrompt (string - MUST BE AT LEAST 700 WORDS of highly detailed narrative outlining and exploration)."
);

fs.writeFileSync(path, content);
