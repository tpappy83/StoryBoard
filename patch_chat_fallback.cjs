const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const originalChat = `      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction,
          temperature: 0.7,
          tools: [{ googleSearch: {} }, { googleMaps: {} }]
        }
      });`;

const newChat = `      const response = await generateContentWithFallback(
        [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
        {
          systemInstruction,
          temperature: 0.7,
          tools: [{ googleSearch: {} }, { googleMaps: {} }]
        },
        2,
        'fast'
      );`;

code = code.replace(originalChat, newChat);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts /api/chat with generateContentWithFallback");
