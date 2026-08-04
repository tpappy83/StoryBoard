const fs = require('fs');
const path = './server.ts';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// The problematic lines are roughly from 871 to 898 (in the 0-indexed array, 870 to 897)
// But to be safe we can use splice if we find the exact text

let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("parsed = JSON.parse(response.text || \"{}\");") && lines[i+1].includes("} catch (err: any) {") && lines[i+2].includes("res.status(500).json({ success: false, error: 'Character synthesis Gemini failed:")) {
    start = i;
  }
  if (lines[i].includes("res.json({ success: true, recall: parsed });") && lines[i+1] && lines[i+1].includes("});")) {
    end = i + 1;
    // But wait, there might be multiple. We only want the one before Writer's Room
    if (lines[i+3] && lines[i+3].includes("Writer's Room")) {
        break;
    }
  }
}

console.log("Start:", start, "End:", end);

if (start !== -1 && end !== -1) {
  const replacement = `      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
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
          type: require('@google/genai').Type.OBJECT,
          properties: {
            matchedFactIds: { type: require('@google/genai').Type.ARRAY, items: { type: require('@google/genai').Type.STRING } },
            summaryAnalysis: { type: require('@google/genai').Type.STRING },
            contradictionWarnings: { type: require('@google/genai').Type.ARRAY, items: { type: require('@google/genai').Type.STRING } }
          },
          required: ["matchedFactIds", "summaryAnalysis", "contradictionWarnings"]
        }
      });
      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Memory recall Gemini failed: ' + err.message });
      return;
    }
    res.json({ success: true, recall: parsed });
  });`;
  
  lines.splice(start, end - start + 1, replacement);
  fs.writeFileSync(path, lines.join('\n'));
  console.log("Replaced!");
}

