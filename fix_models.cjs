const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const modelsToTry = \["gemini-3\.6-flash", "gemini-flash-latest"\];/g,
  'const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];'
);

fs.writeFileSync(path, content);
