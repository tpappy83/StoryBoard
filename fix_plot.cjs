const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /if \(\!branches\) \{\s*res\.status\(500\)\.json\(\{ success: false, error: 'Plot evolution parsing failed\.' \}\);\s*return;\s*\};\s*\}/,
  "if (!branches) {\n        res.status(500).json({ success: false, error: 'Plot evolution parsing failed.' });\n        return;\n      }"
);

fs.writeFileSync(path, content);
