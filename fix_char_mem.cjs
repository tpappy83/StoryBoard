const fs = require('fs');
const path = './server.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /\} catch \(err: any\) \{\s*res\.status\(500\)\.json\(\{ success: false, error: 'Character synthesis Gemini failed: ' \+ err\.message \}\);\s*return;\s*\}\);\s*parsed = JSON\.parse\(response\.text \|\| "\{\}"\);\s*\} catch \(err: any\) \{\s*console\.log\("Memory recall Gemini service busy; running local semantic match\."\);[\s\S]*?contradictionWarnings: \[\]\s*\}\s*\}/;

const replacement = `} catch (err: any) {
      res.status(500).json({ success: false, error: 'Character synthesis Gemini failed: ' + err.message });
      return;
    }
    res.json({ success: true, synthesis: parsed });
  });

  // Gemini Route: Memory Recall
  app.post("/api/gemini/memory-recall", async (req, res) => {
    const { query = '' } = req.body;
    let parsed: any = null;

    try {
      const summaryFacts = canonFacts.map(f => \`[\${f.id}] (\${f.category}) \${f.fact}\`).join("\\n");
      const prompt = \`
You are the Narrative Canon Memory Recall Engine.
User Query / Topic: "\${query}"

Canon Facts in Database:
\${summaryFacts}

Perform deep semantic memory recall:
1. Identify exact or conceptually linked canon facts.
2. Flag any potential narrative contradictions if an author introduces a new scene about this topic.
3. Provide a summary synthesis of how this topic shapes current story state. CRITICAL: The 'summaryAnalysis' MUST BE AT LEAST 700 WORDS of extremely detailed, exhaustive lore breakdown.
\`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 1536 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedFactIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            summaryAnalysis: { type: Type.STRING },
            contradictionWarnings: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["matchedFactIds", "summaryAnalysis", "contradictionWarnings"]
        }
      });
      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Memory recall Gemini failed: ' + err.message });
      return;
    }`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content);
console.log("Fixed char synthesis and memory recall");
