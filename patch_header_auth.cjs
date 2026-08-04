const fs = require('fs');
let code = fs.readFileSync('src/components/HeaderTransport.tsx', 'utf8');

const loginFn = `
  const handleAuth = async () => {
    if (user) {
      await signOut(auth);
    } else {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        console.error("Login failed", err);
      }
    }
  };
`;

code = code.replace("  const getScoreColor = (score: number) => {", loginFn + "\n  const getScoreColor = (score: number) => {");

const buttonUI = `
          <button 
            onClick={handleAuth}
            className="flex items-center space-x-2 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            {user ? (
              <>
                <img src={user.photoURL || ''} alt="avatar" className="w-5 h-5 rounded-full" />
                <span className="text-[#E2E8F0]">{user.displayName}</span>
              </>
            ) : (
              <span className="text-[#E2E8F0]">Sign In</span>
            )}
          </button>
`;

code = code.replace("          <button\n            onClick={onOpenAiDrawer}", buttonUI + "          <button\n            onClick={onOpenAiDrawer}");

fs.writeFileSync('src/components/HeaderTransport.tsx', code);
console.log("Patched handleAuth");
