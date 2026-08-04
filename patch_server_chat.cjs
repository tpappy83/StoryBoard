const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const chatEndpoint = `
  app.post("/api/chat", async (req, res) => {
    const { message, history, context } = req.body;
    try {
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      const systemInstruction = \`You are the Narrative Advisory Council for a writing application. 
Your role is to assist the author with plotting, character development, and narrative consistency.
Here is the current state of the project:
\${JSON.stringify(context)}\`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          temperature: 0.7
        }
      });
      
      res.json({ response: response.text });
    } catch (error: any) {
      console.error("/api/chat error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
`;

code = code.replace("// API Routes", "// API Routes\n" + chatEndpoint);

fs.writeFileSync('server.ts', code);
console.log("Added /api/chat");
