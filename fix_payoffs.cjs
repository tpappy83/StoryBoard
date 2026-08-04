const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /Suggest 3 possible dramatic, high-payoff resolutions\/payoffs consistent with current story canon and characters\./g,
  "Suggest 3 possible dramatic, high-payoff resolutions/payoffs consistent with current story canon and characters. CRITICAL DIRECTIVE: The 'description' field for EACH payoff MUST BE highly detailed and AT LEAST 700 WORDS of expansive narrative breakdown."
);

fs.writeFileSync(path, content);
