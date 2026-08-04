const fs = require('fs');
let code = fs.readFileSync('src/components/HeaderTransport.tsx', 'utf8');

code = code.replace("onOpenAiDrawer: () => void;", "onOpenAiDrawer: () => void;\n  onOpenChat?: () => void;");

code = code.replace("onOpenAiDrawer,", "onOpenAiDrawer,\n  onOpenChat,");

const chatButton = `
          <button
            onClick={onOpenChat}
            className="flex items-center space-x-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>Chat</span>
          </button>
`;

code = code.replace("<button\n            onClick={onOpenAiDrawer}", chatButton + "\n          <button\n            onClick={onOpenAiDrawer}");

fs.writeFileSync('src/components/HeaderTransport.tsx', code);
console.log("Patched HeaderTransport for Chat");
