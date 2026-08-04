const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Imports
const imports = `
import { WebSocketServer } from 'ws';
import { LiveServerMessage, Modality } from '@google/genai';
`;
code = code.replace('import { createServer as createViteServer } from "vite";', 'import { createServer as createViteServer } from "vite";\n' + imports);

// Function to setup WebSocket
const wsSetup = `
function setupLiveApiWebSocket(httpServer: any) {
  const wss = new WebSocketServer({ server: httpServer, path: '/live' });
  
  wss.on("connection", async (clientWs) => {
    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are the Live Narrative State Engine and voice-based Writer's Room consultant. Discuss the story, characters, and plot threads with the author.",
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (err) {
          console.error("Live API WS parse error:", err);
        }
      });

      clientWs.on("close", () => {
        // session.close() is not available directly, wait if needed
      });
    } catch (err) {
      console.error("Live API connection failed:", err);
      clientWs.close();
    }
  });
}
`;

code = code.replace('async function startServer() {', wsSetup + '\nasync function startServer() {');

// Attach WS Server
code = code.replace(
  '  app.listen(PORT, "0.0.0.0", () => {',
  '  const httpServer = app.listen(PORT, "0.0.0.0", () => {'
);
code = code.replace(
  '    console.log(`Server running on http://0.0.0.0:${PORT}`);\n  });',
  '    console.log(`Server running on http://0.0.0.0:${PORT}`);\n  });\n  setupLiveApiWebSocket(httpServer);'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Live API");
