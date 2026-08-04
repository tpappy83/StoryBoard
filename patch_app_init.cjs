const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('useAuthStore.getState().initAuth()')) {
  // Add it to useEffect
  code = code.replace(
    'useEffect(() => {',
    'useEffect(() => {\n    useAuthStore.getState().initAuth();'
  );
  fs.writeFileSync('src/App.tsx', code);
}
