const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import { GuidedTutorial } from './components/GuidedTutorial';", "import { GuidedTutorial } from './components/GuidedTutorial';\nimport { ChatbotDrawer } from './components/ChatbotDrawer';");

code = code.replace("const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);", "const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);\n  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);");

code = code.replace("onOpenAiDrawer={() => setIsAiDrawerOpen(true)}", "onOpenAiDrawer={() => setIsAiDrawerOpen(true)}\n        onOpenChat={() => setIsChatOpen(true)}");

const chatUI = `
      <ChatbotDrawer 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        projectState={{ project, characters, relationships, plotThreads, scenes, timelineEvents, canonFacts, violations, structureMilestones }}
      />
`;
code = code.replace("{/* Guided Tutorial Overlay", chatUI + "\n      {/* Guided Tutorial Overlay");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for Chat");
