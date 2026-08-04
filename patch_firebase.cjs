const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

if (!code.includes('googleAuthProvider')) {
  code += '\nexport const googleAuthProvider = new GoogleAuthProvider();\n';
  fs.writeFileSync('src/firebase.ts', code);
}
