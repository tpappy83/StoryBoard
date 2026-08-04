const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('  const { firebaseUser: user } = useAuthStore();\n', '');
code = code.replace('export default function App() {\n', 'export default function App() {\n  const { firebaseUser: user } = useAuthStore();\n');

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed App user position");
