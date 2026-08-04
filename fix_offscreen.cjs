const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /offscreenActivity, resultingStateChange, timestamp\./g,
  "offscreenActivity (MUST BE AT LEAST 700 WORDS of rich, immersive prose), resultingStateChange, timestamp."
);

fs.writeFileSync(path, content);
