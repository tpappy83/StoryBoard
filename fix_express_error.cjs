const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /throw new Error\("Failed to generate Advisory Council response: " \+ err\.message\);/g,
  `res.status(500).json({ success: false, error: "Failed to generate Advisory Council response: " + err.message });\n      return;`
);

fs.writeFileSync(path, content);
