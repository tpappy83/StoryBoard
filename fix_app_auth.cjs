const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();`;

code = code.replace(target, '');
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed App auth");
