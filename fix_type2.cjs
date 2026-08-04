const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/require\('@google\/genai'\)\.Type/g, "Type");

fs.writeFileSync(path, content);
