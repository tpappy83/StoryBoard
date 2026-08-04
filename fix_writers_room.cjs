const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `      throw new Error("Failed to generate Advisory Council response: " + err.message);
    }

    res.json({ success: true, ...parsed });
  });

  // Gemini Route: Apply Writer's Room Directive to Scene
  app.post("/api/gemini/writers-room-apply", async (req, res) => {
    let revisedProse = "";
    let summaryOfChanges = "";
    const { sceneId, directive } = req.body;
    const targetScene = scenes.find(s => s.id === sceneId);
    
    if (!targetScene) {
      return res.json({ success: false, error: "Scene not found" });
    }

    try {
      const prompt = \`
You are an expert narrative editor applying a specific directive to a scene.

SCENE: "\${targetScene.title}"
CURRENT PROSE:
"\${targetScene.prose}"

DIRECTIVE TO APPLY:
"\${directive}"

Apply this directive to the prose.
Return a JSON object with:
- "revisedProse": string (the fully updated scene prose)
- "summaryOfChanges": string (1-2 sentences summarizing what was altered)
\`;

      const response = await generateContentWithFallback(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: require('@google/genai').Type.OBJECT,
          properties: {
            revisedProse: { type: require('@google/genai').Type.STRING },
            summaryOfChanges: { type: require('@google/genai').Type.STRING }
          },
          required: ["revisedProse", "summaryOfChanges"]
        }
      });`;

const badBlockRegex = /throw new Error\("Failed to generate Advisory Council response: " \+ err\.message\);,[\s\S]*?required: \["revisedProse", "summaryOfChanges"\]\n\s*\}\n\s*\}\);/g;

content = content.replace(badBlockRegex, replacement);

fs.writeFileSync(path, content);
