const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const userState = `
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);
`;

code = code.replace(userState, "");
code = code.replace("const [soundEnabled, setSoundEnabled] = useState<boolean>(true);", "const [soundEnabled, setSoundEnabled] = useState<boolean>(true);\n" + userState);

code = code.replace("useSetupPayoffStore.getState().setSetups", "useSetupPayoffStore.setState({ setups: data.setups }); //");
code = code.replace("useSetupPayoffStore.getState().setPayoffs", "useSetupPayoffStore.setState({ payoffs: data.payoffs }); //");
// wait, the code has:
// if (data.setups) useSetupPayoffStore.getState().setSetups(data.setups);
// Let's just fix it properly.
code = code.replace(/if \(data\.setups\) useSetupPayoffStore\.getState\(\)\.setSetups\(data\.setups\);/g, "if (data.setups) useSetupPayoffStore.setState({ setups: data.setups });");
code = code.replace(/if \(data\.payoffs\) useSetupPayoffStore\.getState\(\)\.setPayoffs\(data\.payoffs\);/g, "if (data.payoffs) useSetupPayoffStore.setState({ payoffs: data.payoffs });");


fs.writeFileSync('src/App.tsx', code);
console.log("Fixed App.tsx user state position");
