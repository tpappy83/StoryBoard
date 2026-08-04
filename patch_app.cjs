const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
`;

code = code.replace("import { PanelContainer } from './components/workspace/PanelContainer';", "import { PanelContainer } from './components/workspace/PanelContainer';\n" + imports);

code = code.replace("const [soundEnabled, setSoundEnabled] = useState<boolean>(true);", "const [soundEnabled, setSoundEnabled] = useState<boolean>(true);\n  const [user, setUser] = useState<User | null>(null);\n\n  useEffect(() => {\n    const unsubscribe = onAuthStateChanged(auth, (u) => {\n      setUser(u);\n    });\n    return () => unsubscribe();\n  }, []);\n");

code = code.replace("<HeaderTransport", "<HeaderTransport user={user}");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for Auth");
