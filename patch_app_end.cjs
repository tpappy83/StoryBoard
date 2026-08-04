const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/    <\/div>\s*\);\s*\}\s*$/, '    </div>\n    </>\n  );\n}\n');

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed App.tsx end");
