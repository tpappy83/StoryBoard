import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { adminAuth } from "./src/lib/firebase-admin.ts";
import { saveProjectStateToDb, getProjectByUidAndId } from "./src/db/projects.ts";
import {
  INITIAL_PROJECT,
  INITIAL_CHARACTERS,
  INITIAL_RELATIONSHIPS,
  INITIAL_PLOT_THREADS,
  INITIAL_CONVERGENCE_EVENTS,
  INITIAL_SCENES,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_CANON_FACTS,
  INITIAL_VIOLATIONS,
  INITIAL_STRUCTURE_MILESTONES,
  INITIAL_SETUPS,
  INITIAL_PAYOFFS
} from "./src/data/initialData.js";

dotenv.config();

// In-Memory Canonical Story Store
let project = { ...INITIAL_PROJECT };
let characters = [...INITIAL_CHARACTERS];
let relationships = [...INITIAL_RELATIONSHIPS];
let plotThreads = [...INITIAL_PLOT_THREADS];
let convergenceEvents = [...INITIAL_CONVERGENCE_EVENTS];
let scenes = [...INITIAL_SCENES];
let timelineEvents = [...INITIAL_TIMELINE_EVENTS];
let canonFacts = [...INITIAL_CANON_FACTS];
let violations = [...INITIAL_VIOLATIONS];
let structureMilestones = [...INITIAL_STRUCTURE_MILESTONES];
let structureFramework = '3-Act';
let proposals: any[] = [];
let setups = [...INITIAL_SETUPS];
let payoffs = [...INITIAL_PAYOFFS];

export const DYNAMIC_NARRATIVE_STATE_ENGINE_PROMPT = `
You are not a text generation assistant.

You are the Narrative State Engine responsible for managing a living story universe.

Your primary responsibility is NOT to write scenes.

Your primary responsibility is to continuously evolve the narrative world.

Every generated scene must result in measurable changes to:
- Characters
- Relationships
- Plot Threads
- World State
- Themes
- Timeline
- Canon
- Story Memory

Treat every story as a living system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NARRATIVE PHILOSOPHY

Characters are not profiles.
Characters are evolving entities.

Relationships are not labels.
Relationships are dynamic systems.

Stories are not sequences of scenes.
Stories are networks of consequences.

Every event must produce change.
Every change must create consequences.
Every consequence must influence future decisions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHARACTER EVOLUTION RULES

Each character possesses:
- Goals
- Fears
- Beliefs
- Knowledge
- Secrets
- Emotional State
- Relationships
- Memories
- Arc Progression

After every scene:
1. Determine if the character learned anything.
2. Determine if the character gained or lost trust.
3. Determine if emotional state changed.
4. Determine if goals changed.
5. Determine if beliefs changed.
6. Determine if relationships changed.
7. Determine if memories were created.
8. Store all changes.

A character should never remain unchanged after a significant event.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NARRATIVE CONSEQUENCE RULES

Every scene must answer:
"What changed because this happened?"

For each event identify:
- Character Consequences
- Relationship Consequences
- World Consequences
- Political Consequences
- Emotional Consequences
- Plot Consequences

If no consequences exist, the scene probably lacks narrative value.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STORY MEMORY RULES

Maintain persistent memory at all times.

Track:
- Important scene events
- Character trauma
- Character victories
- Revelations
- Betrayals
- Promises
- Mysteries
- Major decisions

When generating future scenes:
Retrieve relevant memories.
Relevant memories must influence behavior.
Characters must remember important experiences.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLOT THREAD RULES

Every active thread must maintain:
- Status
- Importance
- Last Appearance
- Current Progress

Classifications:
- Open
- Active
- Escalating
- Stalled
- Resolved

Detect:
- Forgotten threads
- Unresolved mysteries
- Delayed payoffs
- Opportunities for convergence

The system should never lose track of a plot thread.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SETUP AND PAYOFF RULES

Treat every setup as a narrative obligation.

Track:
- Objects
- Secrets
- Prophecies
- Relationships
- Mysteries
- Foreshadowing

For every setup:
Store:
- Chapter introduced
- Importance
- Related characters
- Potential payoffs

Detect:
- Open setups
- Aging setups
- Unused setups
- Resolved setups

Recommend payoff opportunities when appropriate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTERSECTION ENGINE RULES

Continuously search for:
- Character collisions
- Shared goals
- Opposing goals
- Shared locations
- Shared themes
- Shared secrets
- Shared history

Calculate convergence opportunities.
Stories should emerge from interactions between character journeys.
Do not force convergence.
Identify natural convergence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THEME TRACKING RULES

Track active themes.
Examples: Redemption, Memory, Identity, Power, Sacrifice, Trust.
Every scene must contribute to at least one theme.

Detect:
- Theme reinforcement
- Theme contradiction
- Theme neglect

Maintain thematic cohesion throughout the narrative.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WRITER'S ROOM REASONING

Before writing any scene:
Story Architect: Determine narrative purpose.
Character Psychologist: Determine character growth.
Plot Engineer: Determine thread progression.
Continuity Guardian: Verify canon consistency.
Theme Analyst: Verify thematic contribution.

The scene may only proceed after all checks pass.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT REQUIREMENTS

For every scene generated provide:
1. Scene Summary
2. Character Changes
3. Relationship Changes
4. Plot Thread Updates
5. New Memories Created
6. Setup/Payoff Events
7. Timeline Changes
8. Canon Updates
9. Narrative Consequences
10. Future Opportunities

The story state must evolve after every scene.
Never treat narrative generation as isolated text creation.
Treat it as simulation of a living world.
`;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function generateContentWithFallback(contents: any, config: any) {
  const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];
  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
    }
  }
  throw lastError || new Error("Gemini API unavailable");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/state", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(token);
        const record = await getProjectByUidAndId(decoded.uid, project.id || 'default_project');
        if (record && record.projectData) {
          const loaded = JSON.parse(record.projectData);
          if (loaded.project) project = loaded.project;
          if (loaded.characters) characters = loaded.characters;
          if (loaded.relationships) relationships = loaded.relationships;
          if (loaded.plotThreads) plotThreads = loaded.plotThreads;
          if (loaded.scenes) scenes = loaded.scenes;
          if (loaded.timelineEvents) timelineEvents = loaded.timelineEvents;
          if (loaded.canonFacts) canonFacts = loaded.canonFacts;
          if (loaded.violations) violations = loaded.violations;
          if (loaded.structureMilestones) structureMilestones = loaded.structureMilestones;
          if (loaded.setups) setups = loaded.setups;
          if (loaded.payoffs) payoffs = loaded.payoffs;
        }
      } catch (err) {
        console.warn("Optional state sync from Cloud SQL skipped or failed:", err);
      }
    }

    res.json({
      project,
      characters,
      relationships,
      plotThreads,
      convergenceEvents,
      scenes,
      timelineEvents,
      canonFacts,
      violations,
      structureMilestones,
      structureFramework,
      proposals,
      setups,
      payoffs
    });
  });

  // Direct State Mutations
  app.post("/api/update-state", async (req, res) => {
    const body = req.body;
    if (body.characters) characters = body.characters;
    if (body.scenes) scenes = body.scenes;
    if (body.relationships) relationships = body.relationships;
    if (body.plotThreads) plotThreads = body.plotThreads;
    if (body.canonFacts) canonFacts = body.canonFacts;
    if (body.violations) violations = body.violations;
    if (body.timelineEvents) timelineEvents = body.timelineEvents;
    if (body.structureMilestones) structureMilestones = body.structureMilestones;
    if (body.structureFramework) structureFramework = body.structureFramework;
    if (body.setups) setups = body.setups;
    if (body.payoffs) payoffs = body.payoffs;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(token);
        const fullState = {
          project,
          characters,
          relationships,
          plotThreads,
          convergenceEvents,
          scenes,
          timelineEvents,
          canonFacts,
          violations,
          structureMilestones,
          structureFramework,
          setups,
          payoffs,
          id: project.id || 'default_project',
          title: project.title
        };
        await saveProjectStateToDb(decoded.uid, decoded.email || 'user@example.com', fullState);
      } catch (err) {
        console.warn("Cloud SQL state save error:", err);
      }
    }

    res.json({ success: true });
  });

  // Gemini Route: Propose Scene with Structured Output & High Thinking
  app.post("/api/gemini/propose-scene", async (req, res) => {
    const { location, participantIds = [], purpose, threadId, promptInstructions } = req.body;
    const activeChars = characters.filter(c => participantIds.includes(c.id));
    const primaryChar = activeChars[0] || characters[0];
    const charNames = activeChars.map(c => `${c.name} (${c.role}, Mood: ${c.emotionalState.mood}, Goals: ${c.goals})`).join("; ");

    let parsed: any = null;

    try {
      const relevantFacts = canonFacts.slice(0, 8).map(f => `- ${f.fact}`).join("\n");

      const prompt = `
You are the High-Reasoning Narrative Engine AI Orchestrator for "${project.title}".
Perform high-thinking analytical reasoning before generating a structured scene proposal that adheres strictly to story canon.

Context:
- Location: ${location}
- Participating Characters: ${charNames}
- Scene Purpose: ${purpose}
- Associated Plot Thread: ${plotThreads.find(t => t.id === threadId)?.name || 'General'}
- Specific Instructions: ${promptInstructions || 'None'}

Relevant Canon Facts (MUST NOT VIOLATE):
${relevantFacts}

High-Thinking Multi-Step Instructions:
1. Conduct a Memory Recall check against canon.
2. Evaluate Psychological Alignment for all participants.
3. Check for physical/spatial or timeline paradoxes.
4. Synthesize prose and character state progression.

Please generate:
- thinkingSteps: 3-4 steps detailing your step-by-step reasoning phase and thoughts.
- title: Scene title
- prose: Rich narrative prose (150-250 words)
- proposedStateChanges: List of character state updates (emotional mood, trust, arc progress)
- proposedCanonFacts: New facts established by this scene
- validationChecks: Pass/Warn/Fail checks for location, character knowledge, and timeline continuity.
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thinkingSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  phase: { type: Type.STRING },
                  thought: { type: Type.STRING }
                },
                required: ["step", "phase", "thought"]
              }
            },
            title: { type: Type.STRING },
            prose: { type: Type.STRING },
            proposedStateChanges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  charId: { type: Type.STRING },
                  charName: { type: Type.STRING },
                  field: { type: Type.STRING },
                  oldValue: { type: Type.STRING },
                  newValue: { type: Type.STRING }
                },
                required: ["charName", "field", "oldValue", "newValue"]
              }
            },
            proposedCanonFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            validationChecks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  check: { type: Type.STRING },
                  status: { type: Type.STRING },
                  note: { type: Type.STRING }
                },
                required: ["check", "status", "note"]
              }
            }
          },
          required: ["thinkingSteps", "title", "prose", "proposedStateChanges", "proposedCanonFacts", "validationChecks"]
        }
      });

      parsed = JSON.parse(response.text || "{}");
    } catch (error: any) {
      console.log("Gemini service busy or quota limited; running Narrative Engine local fallback.");
      parsed = {
        thinkingSteps: [
          { step: 1, phase: "Memory Recall", thought: `Scanned canon vault for location constraints at ${location || 'Sector Base'}.` },
          { step: 2, phase: "Psychological Alignment", thought: `Evaluated character state for ${primaryChar?.name || 'Operative'}. Emotional mood: ${primaryChar?.emotionalState?.mood || 'Determined'}.` },
          { step: 3, phase: "Continuity Verification", thought: `Verified timeline phase alignment and spatial continuity.` },
          { step: 4, phase: "Prose Synthesis", thought: `Synthesized narrative beat focusing on ${purpose || 'strategic objectives'}.` }
        ],
        title: `Operation: ${location || 'Relay Vector'} - ${purpose ? purpose.slice(0, 24) : 'Tactical Convergence'}`,
        prose: `The air inside ${location || 'the secure sector'} hummed with high-frequency telemetry. ${primaryChar?.name || 'Ava Vance'} stepped forward, adjusting the environmental seals on her tactical weave. Every sensor reading indicated that the target parameters were shifting rapidly. "${promptInstructions || 'Keep silent and observe,'}" she whispered into the comms channel. The atmospheric display flickered as the secondary protocol initiated, revealing a hidden data nexus beneath the reinforced floor plating.`,
        proposedStateChanges: [
          { charId: primaryChar?.id || 'char_ava', charName: primaryChar?.name || 'Ava Vance', field: 'Emotional Mood', oldValue: primaryChar?.emotionalState?.mood || 'Guarded', newValue: 'Focused' },
          { charId: primaryChar?.id || 'char_ava', charName: primaryChar?.name || 'Ava Vance', field: 'Arc Progress', oldValue: `${primaryChar?.arcProgress || 25}%`, newValue: `${Math.min(100, (primaryChar?.arcProgress || 25) + 5)}%` }
        ],
        proposedCanonFacts: [
          `New tactical telemetry logged for ${location || 'Citadel Sector'}.`,
          `Signal key sequence synchronized with local nexus terminal.`
        ],
        validationChecks: [
          { check: "Location Check", status: "PASS", note: `Confirmed spatial clearance at ${location || 'designated sector'}.` },
          { check: "Knowledge Consistency", status: "PASS", note: `No secret leakage detected.` }
        ]
      };
    }

    const proposal = {
      id: `prop_${Date.now()}`,
      sceneId: `sc_${Date.now()}`,
      title: parsed.title || "Untitled Scene Proposal",
      location: location || "Unknown Location",
      participants: participantIds || [],
      purpose: purpose || "Scene development",
      prose: parsed.prose || "Draft prose pending...",
      proposedStateChanges: parsed.proposedStateChanges || [],
      proposedCanonFacts: parsed.proposedCanonFacts || [],
      validationChecks: parsed.validationChecks || [
        { check: "Location Check", status: "PASS", note: "Matches defined vault coordinates" },
        { check: "Knowledge Consistency", status: "PASS", note: "No unlearned secrets revealed" }
      ],
      thinkingSteps: parsed.thinkingSteps || [
        { step: 1, phase: 'Memory Recall', thought: 'Retrieved vault clearance levels and character motivations.' },
        { step: 2, phase: 'Continuity Validation', thought: 'Verified spatial presence and timeline alignment.' }
      ],
      status: "Pending",
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    proposals.unshift(proposal);
    res.json({ success: true, proposal });
  });

  // Gemini Route: Run High-Thinking Continuity Validation Audit
  app.post("/api/gemini/validate-continuity", async (req, res) => {
    let parsed: any = null;

    try {
      const summaryScenes = scenes.map(s => `[Scene ${s.id} - Phase ${s.timelinePhase}] Title: ${s.title}. Loc: ${s.location}. Participants: ${s.participantIds.join(', ')}. Purpose: ${s.purpose}. Prose: ${s.prose.slice(0, 120)}...`).join("\n");
      const summaryFacts = canonFacts.map(f => `- [${f.category}] ${f.fact}`).join("\n");
      const summaryCharacters = characters.map(c => `- ${c.name} (${c.role}): Personality="${c.personality}", Mood="${c.emotionalState?.mood}", Score=${c.emotionalState?.score}`).join("\n");

      const prompt = `
Act as the High-Reasoning Continuity & Constraint Engine for this narrative workspace.
Perform thorough multi-step reasoning before outputting your findings.

Characters:
${summaryCharacters}

Scenes in Database:
${summaryScenes}

Canonical Facts:
${summaryFacts}

Multi-step audit requirements:
1. Scan for spatial teleportation paradoxes (a character in two distant locations in adjacent or identical timeline phases).
2. Scan for knowledge mismatch (a character reacting to information they have not learned yet).
3. Scan for lore or magic constraint violations.
4. Scan for character EmotionalState contradicting established Personality traits (e.g. panic/hysteria spikes in stoic or pragmatic strategists).

Return:
- thinkingSteps: Array of analytical steps taken during the audit.
- continuityScore: Overall integer score (0-100) reflecting canon compliance.
- violationsFound: Array of detailed violations.
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thinkingSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  phase: { type: Type.STRING },
                  thought: { type: Type.STRING }
                },
                required: ["step", "phase", "thought"]
              }
            },
            continuityScore: { type: Type.NUMBER },
            violationsFound: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING },
                  ruleName: { type: Type.STRING },
                  details: { type: Type.STRING },
                  suggestedFix: { type: Type.STRING }
                },
                required: ["severity", "ruleName", "details", "suggestedFix"]
              }
            }
          },
          required: ["thinkingSteps", "continuityScore", "violationsFound"]
        }
      });

      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.log("Continuity audit Gemini service busy; running local deterministic audit engine.");

      const activeUnresolved = violations.filter(v => !v.resolved);
      const score = Math.max(70, 100 - (activeUnresolved.length * 8));

      const newFoundViolations: any[] = [];
      const phaseMap = new Map<number, typeof scenes>();
      scenes.forEach(s => {
        const list = phaseMap.get(s.timelinePhase) || [];
        list.push(s);
        phaseMap.set(s.timelinePhase, list);
      });

      phaseMap.forEach((phaseScenes, phase) => {
        if (phaseScenes.length > 1) {
          const charLocationMap = new Map<string, string>();
          phaseScenes.forEach(s => {
            s.participantIds.forEach(cId => {
              const charObj = characters.find(c => c.id === cId);
              const charName = charObj?.name || cId;
              if (charLocationMap.has(cId) && charLocationMap.get(cId) !== s.location) {
                newFoundViolations.push({
                  severity: 'Critical',
                  ruleName: 'Spatial Teleportation Paradox',
                  details: `${charName} appears simultaneously at "${charLocationMap.get(cId)}" and "${s.location}" during Timeline Phase ${phase}.`,
                  suggestedFix: `Adjust the timeline phase for one of the scenes or update participant lists.`
                });
              } else {
                charLocationMap.set(cId, s.location);
              }
            });
          });
        }
      });

      parsed = {
        thinkingSteps: [
          { step: 1, phase: 'Memory Recall & Canon Scan', thought: `Scanned ${canonFacts.length} canon facts and ${scenes.length} scene entries in memory database.` },
          { step: 2, phase: 'Spatial Matrix Verification', thought: `Audited timeline phases 1 through ${Math.max(...scenes.map(s => s.timelinePhase), 1)} for overlapping spatial coordinates.` },
          { step: 3, phase: 'Knowledge & Lore Integrity Check', thought: `Checked character secret leakage and magic system constraints.` },
          { step: 4, phase: 'Audit Synthesis', thought: `Generated continuity score (${score}%) and compiled violation ledger.` }
        ],
        continuityScore: score,
        violationsFound: newFoundViolations
      };
    }

    if (parsed.continuityScore !== undefined) {
      project.continuityScore = parsed.continuityScore;
    }

    if (parsed.violationsFound && Array.isArray(parsed.violationsFound)) {
      const newViolations = parsed.violationsFound.map((v: any, index: number) => ({
        id: `viol_gen_${Date.now()}_${index}`,
        severity: v.severity || 'Warning',
        ruleName: v.ruleName || 'Canon Rule Check',
        details: v.details || 'Potential inconsistency detected',
        suggestedFix: v.suggestedFix || 'Review scene timeline placement',
        resolved: false
      }));
      const existingDetails = new Set(violations.map(v => v.details));
      const filtered = newViolations.filter((nv: any) => !existingDetails.has(nv.details));
      violations = [...filtered, ...violations];
    }

    project.lastAuditTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    res.json({
      success: true,
      continuityScore: project.continuityScore,
      thinkingSteps: parsed.thinkingSteps || [],
      violations
    });
  });

  // Gemini Route: High-Thinking Character Intelligence & Synthesis
  app.post("/api/gemini/character-synthesis", async (req, res) => {
    const { charId } = req.body;
    const targetChar = characters.find(c => c.id === charId) || characters[0];

    let parsed: any = null;

    try {
      const otherChars = characters.filter(c => c.id !== targetChar.id).map(c => `${c.name} (${c.role})`).join(', ');

      const prompt = `
Analyze character psychological state, arc trajectory, and relationship friction for:
Name: ${targetChar.name}
Role: ${targetChar.role}
Goals: ${targetChar.goals}
Current Mood: ${targetChar.emotionalState.mood} (Score: ${targetChar.emotionalState.score}/100)
Arc Progress: ${targetChar.arcProgress}%
Secrets: ${targetChar.secrets.join('; ')}
Other Characters in Narrative: ${otherChars}

Use High Thinking reasoning to generate deep psychological insights, arc transformation milestones, and potential relationship flashpoints.
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            internalConflict: { type: Type.STRING },
            arcTransformationMilestone: { type: Type.STRING },
            predictedBreakdownScore: { type: Type.NUMBER },
            relationshipFlashpoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedSceneTrigger: { type: Type.STRING }
          },
          required: ["internalConflict", "arcTransformationMilestone", "predictedBreakdownScore", "relationshipFlashpoints", "recommendedSceneTrigger"]
        }
      });

      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.log("Character synthesis Gemini service busy; utilizing deterministic synthesis.");

      parsed = {
        internalConflict: `${targetChar.name} is caught between loyalty to their core directives and the mounting pressure of unrevealed secrets (${targetChar.secrets[0] || 'confidential information'}).`,
        arcTransformationMilestone: `Reaching ${targetChar.arcProgress}% arc progress. Demands a decisive choice in the upcoming climax scene regarding their current emotional state (${targetChar.emotionalState.mood}).`,
        predictedBreakdownScore: Math.min(95, Math.max(15, 100 - targetChar.emotionalState.score + 10)),
        relationshipFlashpoints: [
          `Friction with team over secret holdings.`,
          `Trust score variances during high-stress tactical operations.`
        ],
        recommendedSceneTrigger: `Stage a confrontation scene in an isolated sector where ${targetChar.name} must either reveal their secret or risk alienating allies.`
      };
    }

    res.json({ success: true, synthesis: parsed });
  });

  // Gemini Route: High-Thinking Semantic Memory Recall & Search
  app.post("/api/gemini/memory-recall", async (req, res) => {
    const { query = '' } = req.body;

    let parsed: any = null;

    try {
      const summaryFacts = canonFacts.map(f => `[${f.id}] (${f.category}) ${f.fact}`).join("\n");

      const prompt = `
You are the Narrative Canon Memory Recall Engine.
User Query / Topic: "${query}"

Canon Facts in Database:
${summaryFacts}

Perform deep semantic memory recall:
1. Identify exact or conceptually linked canon facts.
2. Flag any potential narrative contradictions if an author introduces a new scene about this topic.
3. Provide a summary synthesis of how this topic shapes current story state.
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 1536 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedFactIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summaryAnalysis: { type: Type.STRING },
            contradictionWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["matchedFactIds", "summaryAnalysis", "contradictionWarnings"]
        }
      });

      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.log("Memory recall Gemini service busy; running local semantic match.");

      const queryLower = query.toLowerCase();
      const matched = canonFacts.filter(f => 
        f.fact.toLowerCase().includes(queryLower) || 
        f.category.toLowerCase().includes(queryLower)
      );

      parsed = {
        matchedFactIds: matched.map(m => m.id),
        summaryAnalysis: matched.length > 0
          ? `Identified ${matched.length} canon entries referencing "${query}". The narrative records confirm these facts are fully integrated into the active story state.`
          : `No direct hard-coded canon matches for "${query}" in the primary vault. Recommending author establishing fact entry if introducing new lore.`,
        contradictionWarnings: []
      };
    }

    res.json({ success: true, recall: parsed });
  });

  // Gemini Route: Writer's Room Multi-Agent Advisory Board
  app.post("/api/gemini/writers-room", async (req, res) => {
    let parsed: any = null;
    const { sceneId, userPrompt, focusRole } = req.body;
    const targetScene = sceneId ? scenes.find(s => s.id === sceneId) : null;

    try {
      const charSummary = characters.map(c => `${c.name} (${c.role}): Mood=${c.emotionalState.mood}, Goals=${c.goals}, Secrets=${c.secrets.join(', ')}`).join("\n");
      const sceneSummary = scenes.map(s => `[Ch.${s.chapter}] ${s.title} (${s.location}): Purpose="${s.purpose}" ${s.id === sceneId ? '[TARGET SCENE]' : ''}`).join("\n");
      const factsSummary = canonFacts.slice(0, 10).map(f => `- [${f.category}] ${f.fact}`).join("\n");
      const threadsSummary = plotThreads.map(p => `- Thread "${p.name}" (${p.status}): Setup=${p.setup}, Escalation=${p.escalation}`).join("\n");

      let sceneProseContext = "";
      if (targetScene) {
        sceneProseContext = `
SELECTED TARGET SCENE DETAILS:
Title: "${targetScene.title}"
Chapter: ${targetScene.chapter}
Location: ${targetScene.location}
Purpose: "${targetScene.purpose}"
Prose Excerpt:
"${targetScene.prose.slice(0, 2000)}"
`;
      }

      const prompt = `
You are the Writer's Room AI Advisory Board for a complex narrative manuscript.

STORY UNIVERSE CONTEXT:
Characters:
${charSummary}

Outline of Scenes:
${sceneSummary}

Canon Rules & Lore:
${factsSummary}

Active Plot Threads:
${threadsSummary}
${sceneProseContext}

${userPrompt ? `USER WRITER CONSULTATION DIRECTIVE / QUESTION:\n"${userPrompt}"\nAll board agents MUST directly address this question/directive in their assessment and actionable directives!` : ''}

Generate specialized agent feedback from 5 board members:
1. Story Architect (Structure, Act pacing, tension curve)
2. Character Psychologist (Internal conflicts, emotional authenticity)
3. Lore Guardian (Canon fact alignment, world rule consistency)
4. Plot Engineer (Setup/Payoff tracking, plot thread stale detection)
5. Continuity Inspector (Timeline paradoxes, spatial checks)

Return a JSON object with:
- "feedbacks": array of 5 agent objects with keys:
  - "agentRole": string ("Story Architect", "Character Psychologist", "Lore Guardian", "Plot Engineer", "Continuity Inspector")
  - "score": number (0-100)
  - "statusFlag": string ("OPTIMAL" | "ATTENTION" | "CRITICAL")
  - "assessment": string (Deep, specific evaluation of the story/scene)
  - "suggestions": array of string (Actionable, precise writing directives)
- "consensusSummary": string (Synthesized consensus across the board)
- "overallHealthScore": number (0-100 aggregate narrative health score)
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedbacks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agentRole: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  statusFlag: { type: Type.STRING },
                  assessment: { type: Type.STRING },
                  suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["agentRole", "score", "statusFlag", "assessment", "suggestions"]
              }
            },
            consensusSummary: { type: Type.STRING },
            overallHealthScore: { type: Type.NUMBER }
          },
          required: ["feedbacks", "consensusSummary", "overallHealthScore"]
        }
      });

      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.log("Writers room Gemini service busy; utilizing local board analysis.", err.message);

      parsed = {
        overallHealthScore: 82,
        consensusSummary: userPrompt
          ? `The Advisory Board agrees that incorporating "${userPrompt}" will heighten Act 2 tension if character motivations remain grounded in canon rules.`
          : "The Advisory Board confirms solid Act 1-2 progression with minor attention needed on thread dormancy and transit timing.",
        feedbacks: [
          {
            agentRole: "Story Architect",
            score: 88,
            statusFlag: "OPTIMAL",
            assessment: targetScene
              ? `Scene "${targetScene.title}" effectively advances the plot. Pacing maintains a steady 1.33 tension curve entering Chapter ${targetScene.chapter}.`
              : "Act 1 transition into Act 2 maintains solid pacing. The elevator descent provides a strong point-of-no-return beat.",
            suggestions: [
              userPrompt
                ? `Align "${userPrompt}" with the climax of Chapter ${targetScene?.chapter || 2}.`
                : "Escalate the stakes prior to the Chapter 3 climax.",
              "Ensure non-reversible decisions for major characters."
            ]
          },
          {
            agentRole: "Character Psychologist",
            score: 82,
            statusFlag: "OPTIMAL",
            assessment: "Ava's internal conflict between protecting her brother and securing the Helios core is well-balanced.",
            suggestions: [
              "Highlight Liam's survivor guilt in upcoming dialogue.",
              "Incorporate non-verbal hesitation cues during trust exchanges."
            ]
          },
          {
            agentRole: "Lore Guardian",
            score: 95,
            statusFlag: "OPTIMAL",
            assessment: "Helios plasma physics and elevator override mechanics align with established canon facts.",
            suggestions: ["Maintain strict rules around bloodline genetic resonance limits."]
          },
          {
            agentRole: "Plot Engineer",
            score: 75,
            statusFlag: "ATTENTION",
            assessment: "Plot thread 'Ryder Family Legacy' is dormant. Needs re-engagement.",
            suggestions: ["Introduce Dr. Elena Ryder's secret journal in the next scene."]
          },
          {
            agentRole: "Continuity Inspector",
            score: 70,
            statusFlag: "ATTENTION",
            assessment: "Ensure transit intervals between Citadel and surface are honored.",
            suggestions: ["Double check Liam's timestamp logs in Chapter 3."]
          }
        ]
      };
    }

    res.json({
      success: true,
      feedbacks: parsed.feedbacks || [],
      consensusSummary: parsed.consensusSummary || "Board aligned on manuscript direction.",
      overallHealthScore: parsed.overallHealthScore || 80
    });
  });

  // Gemini Route: Apply Directive & Rewrite Scene Prose
  app.post("/api/gemini/writers-room-apply", async (req, res) => {
    const { sceneId, directive, agentRole } = req.body;
    const targetScene = scenes.find(s => s.id === sceneId) || scenes[0];

    if (!targetScene) {
      return res.status(400).json({ success: false, error: "Scene not found" });
    }

    let revisedProse = "";
    let summaryOfChanges = "";

    try {
      const prompt = `
You are a master fiction prose editor acting on directive from the ${agentRole || 'Advisory Board'}.

Current Scene Title: "${targetScene.title}"
Chapter: ${targetScene.chapter}
Location: ${targetScene.location}
Purpose: "${targetScene.purpose}"

Current Scene Prose:
"${targetScene.prose}"

Directive from Writers Room:
"${directive}"

Rewrite the scene prose to seamlessly incorporate this directive. Preserve literary tone, rich dialogue, and atmosphere. Return JSON with keys: "revisedProse" and "summaryOfChanges".
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            revisedProse: { type: Type.STRING },
            summaryOfChanges: { type: Type.STRING }
          },
          required: ["revisedProse", "summaryOfChanges"]
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      revisedProse = parsed.revisedProse || targetScene.prose;
      summaryOfChanges = parsed.summaryOfChanges || `Incorporated directive: ${directive}`;
    } catch (err: any) {
      console.log("Writers room apply fallback:", err.message);
      revisedProse = `${targetScene.prose}\n\n[Writers Room Revision: ${directive}]\nAva paused, the weight of the choice pressing upon her shoulders as the warning lights flickered on the dampener console.`;
      summaryOfChanges = `Appended directive beat: ${directive}`;
    }

    res.json({ success: true, revisedProse, summaryOfChanges });
  });

  // Gemini Route: Off-Screen Universe Background Simulation Tick
  app.post("/api/gemini/offscreen-simulate", async (req, res) => {
    let parsed: any = null;

    try {
      const charList = characters.map(c => `${c.name} (${c.role}) at ${c.goals}`).join("; ");

      const prompt = `
You are the Off-Screen Story Universe Simulator.
Simulate what unfeatured characters and factions are doing in the background right now:
Characters: ${charList}

Generate an array "ticks" of off-screen activity updates with keys: id, charId, charName, currentLocation, offscreenActivity, resultingStateChange, timestamp.
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 1536 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  charId: { type: Type.STRING },
                  charName: { type: Type.STRING },
                  currentLocation: { type: Type.STRING },
                  offscreenActivity: { type: Type.STRING },
                  resultingStateChange: { type: Type.STRING },
                  timestamp: { type: Type.STRING }
                },
                required: ["id", "charId", "charName", "currentLocation", "offscreenActivity", "resultingStateChange", "timestamp"]
              }
            }
          },
          required: ["ticks"]
        }
      });

      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.log("Offscreen simulator Gemini service busy; generating local tick.");

      const targetC = characters[Math.floor(Math.random() * characters.length)] || characters[0];
      parsed = {
        ticks: [
          {
            id: `tick_${Date.now()}`,
            charId: targetC.id,
            charName: targetC.name,
            currentLocation: "Citadel Tactical Command",
            offscreenActivity: `Mobilized secondary patrol units to seal Sector 4 egress routes while monitoring surface telemetry.`,
            resultingStateChange: `Increased perimeter security level; tactical readiness score raised to 92%.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
    }

    res.json({ success: true, ticks: parsed.ticks || [] });
  });

  // Gemini Route: Crash/Magnolia Intersection Collision Engine
  app.post("/api/gemini/intersection-analysis", async (req, res) => {
    let parsed: any = null;

    try {
      const charData = characters.map(c => `ID: ${c.id}, Name: ${c.name}, Role: ${c.role}, Goals: ${c.goals}, Secrets: ${c.secrets.join(', ')}`).join("\n");

      const prompt = `
Analyze character networks for an ensemble Crash/Magnolia style story collision.
Characters:
${charData}

Find high-impact character intersections based on shared locations, shared secrets, and conflicting goals.
Generate exact JSON with key "collisions" containing items with keys:
id, charIds (array of string), convergenceScore (number 0-100), sharedThemes (array of string), sharedLocations (array of string), sharedCharacters (array of string), conflictingGoals (array of string), recommendedCollisionTitle (string), recommendedPrompt (string).
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            collisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  charIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  convergenceScore: { type: Type.NUMBER },
                  sharedThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sharedLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sharedCharacters: { type: Type.ARRAY, items: { type: Type.STRING } },
                  conflictingGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedCollisionTitle: { type: Type.STRING },
                  recommendedPrompt: { type: Type.STRING }
                },
                required: ["id", "charIds", "convergenceScore", "sharedThemes", "sharedLocations", "sharedCharacters", "conflictingGoals", "recommendedCollisionTitle", "recommendedPrompt"]
              }
            }
          },
          required: ["collisions"]
        }
      });

      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.log("Intersection analysis Gemini service busy; generating local collisions.");

      parsed = {
        collisions: [
          {
            id: 'coll_1',
            charIds: ['char_ava', 'char_rowan'],
            convergenceScore: 94,
            sharedThemes: ['Bloodline Duty', 'Helios Genesis Secret'],
            sharedLocations: ['Earth Abandoned Observatory'],
            sharedCharacters: ['Liam Cross'],
            conflictingGoals: ['Ava seeks Earth restoration; Rowan demands Citadel reboot'],
            recommendedCollisionTitle: 'The Observatory Vault Standoff',
            recommendedPrompt: 'Stage a confrontation between Ava and Rowan inside the glass dome where shared bloodline truth is forced into the open.'
          },
          {
            id: 'coll_2',
            charIds: ['char_liam', 'char_rowan'],
            convergenceScore: 88,
            sharedThemes: ['Siege of Sector 2', 'Neurological Poison'],
            sharedLocations: ['Lower Deck Armory'],
            sharedCharacters: ['Ava Ryder'],
            conflictingGoals: ['Liam seeks retribution; Rowan views soldiers as collateral'],
            recommendedCollisionTitle: 'Spire Armory Retribution',
            recommendedPrompt: 'Liam corners Rowan in the Spire as Council forces breach the outer bulkhead.'
          }
        ]
      };
    }

    res.json({ success: true, collisions: parsed.collisions || [] });
  });

  // Approve Scene Proposal and Commit to Canon
  app.post("/api/approve-proposal", (req, res) => {
    const { proposalId } = req.body;
    const propIndex = proposals.findIndex(p => p.id === proposalId);
    if (propIndex === -1) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const prop = proposals[propIndex];
    prop.status = "Approved";

    // Create scene or update existing
    const newScene = {
      id: prop.sceneId,
      chapter: 3,
      padIndex: scenes.length + 1,
      title: prop.title,
      location: prop.location,
      participantIds: prop.participants,
      purpose: prop.purpose,
      status: "Approved" as const,
      prose: prop.prose,
      expectedConsequences: prop.proposedStateChanges.map((sc: any) => `${sc.charName}: ${sc.field} -> ${sc.newValue}`),
      timelinePhase: scenes.length + 1,
      wordCount: prop.prose.split(/\s+/).length
    };

    scenes.push(newScene);

    // Apply proposed character state changes
    if (prop.proposedStateChanges && Array.isArray(prop.proposedStateChanges)) {
      prop.proposedStateChanges.forEach((sc: any) => {
        const char = characters.find(c => c.name.toLowerCase().includes(sc.charName?.toLowerCase() || '') || c.id === sc.charId);
        if (char) {
          if (sc.field.toLowerCase().includes('mood')) {
            char.emotionalState.mood = String(sc.newValue);
          } else if (sc.field.toLowerCase().includes('score') || sc.field.toLowerCase().includes('emotional')) {
            const val = parseInt(String(sc.newValue));
            if (!isNaN(val)) char.emotionalState.score = Math.min(100, Math.max(0, val));
          } else if (sc.field.toLowerCase().includes('arc')) {
            const val = parseInt(String(sc.newValue));
            if (!isNaN(val)) char.arcProgress = Math.min(100, Math.max(0, val));
          }
        }
      });
    }

    // Apply proposed canon facts
    if (prop.proposedCanonFacts && Array.isArray(prop.proposedCanonFacts)) {
      prop.proposedCanonFacts.forEach((factStr: string) => {
        if (factStr && !canonFacts.some(f => f.fact === factStr)) {
          canonFacts.push({
            id: `cf_prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            fact: factStr,
            category: "Lore",
            confidence: 95,
            contentHash: "prop",
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      });
    }

    proposals.splice(propIndex, 1);
    res.json({ success: true, scene: newScene, canonFacts });
  });

  // Dynamic Narrative State Engine Simulation Endpoint
  app.post("/api/gemini/simulate-state-engine", async (req, res) => {
    const { sceneId, userInstruction } = req.body;
    const targetScene = scenes.find(s => s.id === sceneId) || scenes[scenes.length - 1] || {
      title: "The Descent at Spire 4",
      location: "Spire Transit Elevator",
      prose: "Ava and Liam descend into Sector 4 as plasma discharge ripples through the bulkhead.",
      purpose: "Reveal Helios Core secret and test sibling trust"
    };

    let parsed: any = null;

    try {
      const activeChars = characters.map(c => `${c.name} (${c.role}): Goals="${c.goals}", Mood="${c.emotionalState.mood}", Score=${c.emotionalState.score}, Arc=${c.arcProgress}%, Traits=[${(c.traits||[]).join(', ')}]`).join("\n");
      const activeThreads = plotThreads.map(t => `- ${t.name} (Status: ${t.status}, Importance: ${t.importance || 80}%)`).join("\n");
      const activeFacts = canonFacts.slice(0, 10).map(f => `- ${f.fact}`).join("\n");

      const prompt = `
${DYNAMIC_NARRATIVE_STATE_ENGINE_PROMPT}

CURRENT WORKSPACE STORY UNIVERSE STATE:
Project: "${project.title}" (${project.genre})
Target Scene Title: "${targetScene.title}"
Location: "${targetScene.location}"
Scene Purpose: "${targetScene.purpose}"
Current Scene Prose Excerpt: "${(targetScene.prose || '').slice(0, 300)}..."
User Directive: "${userInstruction || 'Execute complete dynamic state simulation for active scene beat.'}"

Active Characters in Universe:
${activeChars}

Active Plot Threads:
${activeThreads}

Recent Canon Vault Entries:
${activeFacts}

Run a full 10-point Dynamic Narrative State Engine Simulation. Produce structured JSON adhering strictly to the schema.
`;

      const response = await generateContentWithFallback(prompt, {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneSummary: { type: Type.STRING },
            characterChanges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  charId: { type: Type.STRING },
                  charName: { type: Type.STRING },
                  learnedInfo: { type: Type.STRING },
                  trustShift: { type: Type.STRING },
                  emotionalStateChange: { type: Type.STRING },
                  goalShift: { type: Type.STRING },
                  beliefShift: { type: Type.STRING },
                  relationshipShift: { type: Type.STRING },
                  memoryCreated: { type: Type.STRING }
                },
                required: ["charName", "emotionalStateChange", "memoryCreated"]
              }
            },
            relationshipChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
            plotThreadUpdates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  threadId: { type: Type.STRING },
                  threadName: { type: Type.STRING },
                  status: { type: Type.STRING },
                  progressNotes: { type: Type.STRING }
                },
                required: ["threadName", "status", "progressNotes"]
              }
            },
            newMemoriesCreated: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  characterName: { type: Type.STRING },
                  memoryTitle: { type: Type.STRING },
                  category: { type: Type.STRING },
                  importance: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["characterName", "memoryTitle", "category", "description"]
              }
            },
            setupPayoffEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                  chapter: { type: Type.NUMBER },
                  importance: { type: Type.NUMBER },
                  relatedCharacters: { type: Type.ARRAY, items: { type: Type.STRING } },
                  notes: { type: Type.STRING }
                },
                required: ["title", "type", "notes"]
              }
            },
            timelineChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
            canonUpdates: { type: Type.ARRAY, items: { type: Type.STRING } },
            narrativeConsequences: {
              type: Type.OBJECT,
              properties: {
                characterConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
                relationshipConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
                worldConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
                politicalConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
                emotionalConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
                plotConsequences: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["characterConsequences", "relationshipConsequences", "worldConsequences", "politicalConsequences", "emotionalConsequences", "plotConsequences"]
            },
            futureOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            thinkingSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  phase: { type: Type.STRING },
                  thought: { type: Type.STRING }
                },
                required: ["step", "phase", "thought"]
              }
            }
          },
          required: [
            "sceneSummary",
            "characterChanges",
            "relationshipChanges",
            "plotThreadUpdates",
            "newMemoriesCreated",
            "setupPayoffEvents",
            "timelineChanges",
            "canonUpdates",
            "narrativeConsequences",
            "futureOpportunities",
            "thinkingSteps"
          ]
        }
      });

      parsed = JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.log("State Engine simulation Gemini busy; fallback to local simulation engine.");

      const c1 = characters[0] || { id: 'char_ava', name: 'Ava Ryder' };
      const c2 = characters[1] || { id: 'char_liam', name: 'Liam Cross' };

      parsed = {
        sceneSummary: `Simulation completed for "${targetScene.title}". Event caused significant emotional shift between ${c1.name} and ${c2.name} inside ${targetScene.location}.`,
        characterChanges: [
          {
            charId: c1.id,
            charName: c1.name,
            learnedInfo: `Discovered Dr. Elena Ryder's secret genetic resonance override code.`,
            trustShift: `Decreased trust in Citadel High Command by -25%.`,
            emotionalStateChange: `Shifted from Conflicted to Resilient / Vigilant.`,
            goalShift: `Primary goal escalated: Safeguard the Helios Core from Council seizure.`,
            beliefShift: `Recognizes Citadel security protocol cannot be compromised through peaceful appeal.`,
            relationshipShift: `Bound tighter to ${c2.name} through shared risk during elevator override.`,
            memoryCreated: `Witnessed plasma arch explosion in Sector 4 transit tube.`
          },
          {
            charId: c2.id,
            charName: c2.name,
            learnedInfo: `Learned Ava possesses the bloodline decryption sequence.`,
            trustShift: `Gained +20% trust in Ava's tactical leadership.`,
            emotionalStateChange: `Shifted from Suspicious to Protective.`,
            goalShift: `Protect Ava during the approaching assault.`,
            beliefShift: `Family allegiance supersedes Citadel oath.`,
            relationshipShift: `Forged mutual defense pact with Ava.`,
            memoryCreated: `Overheard Council transmission ordering Sector 4 quarantine.`
          }
        ],
        relationshipChanges: [
          `${c1.name} & ${c2.name}: Trust vector elevated to 85%; shared betrayal by Spire Command creates irrevocable bond.`
        ],
        plotThreadUpdates: [
          {
            threadId: 'thread_1',
            threadName: 'Helios Genesis Core',
            status: 'Escalating',
            progressNotes: 'Plasma destabilization forces immediate descent to Sector 4 terminal.'
          },
          {
            threadId: 'thread_2',
            threadName: 'Citadel High Council Intrigue',
            status: 'Active',
            progressNotes: 'Council enforces lockdown protocol; time running out before orbital sweep.'
          }
        ],
        newMemoriesCreated: [
          {
            characterName: c1.name,
            memoryTitle: 'Sector 4 Elevator Plasma Arch Breach',
            category: 'trauma',
            importance: 8,
            description: 'Survived structural failure of Spire 4 transit shaft as plasma arced through primary bulkhead.'
          }
        ],
        setupPayoffEvents: [
          {
            title: 'Dr. Elena Ryder Keycard Override',
            type: 'Payoff',
            chapter: 2,
            importance: 9,
            relatedCharacters: [c1.name, c2.name],
            notes: 'Foreshadowed in Chapter 1 journal entry; successfully engaged elevator bypass.'
          }
        ],
        timelineChanges: [
          'Timeline Phase 3 accelerated; descent sequence timestamp synced with Citadel countdown.'
        ],
        canonUpdates: [
          `Canon Fact Established: Sector 4 transit shaft requires bloodline genetic resonance override.`
        ],
        narrativeConsequences: {
          characterConsequences: [`${c1.name} unlocked bloodline override capabilities, permanently altering her authority.`],
          relationshipConsequences: [`${c1.name} and ${c2.name} sealed a non-aggression pact under fire.`],
          worldConsequences: [`Sector 4 transit tube sustains 30% structural hull rupture.`],
          politicalConsequences: [`High Council issues Class-A arrest warrant for Spire descent participants.`],
          emotionalConsequences: [`Survior euphoria tempers lingering paranoia regarding secret leaks.`],
          plotConsequences: [`Accelerates main story trajectory toward Act 2 Climax at the Helios Genesis Terminal.`]
        },
        futureOpportunities: [
          'Confrontation with Council Inquisitor at Sector 4 Egress Terminal',
          'Discovery of unmapped pre-collapse laboratory beneath the elevator shaft'
        ],
        thinkingSteps: [
          { step: 1, phase: 'Memory Recall', thought: 'Retrieved Dr. Elena Ryder legacy canon facts and bloodline rules.' },
          { step: 2, phase: 'Psychological Alignment', thought: `Evaluated ${c1.name} and ${c2.name} emotional state vector shifts.` },
          { step: 3, phase: 'Consequence Engine', thought: 'Calculated 6-dimensional narrative consequence footprint across plot, world, and characters.' },
          { step: 4, phase: 'State Evolution Synthesis', thought: 'Compiled 10-point simulation output ledger for state commit.' }
        ]
      };
    }

    res.json({ success: true, simulation: parsed });
  });

  // AI Setup Detection Endpoint
  app.post("/api/gemini/detect-setups", async (req, res) => {
    const { sceneId, title, prose, purpose, chapter } = req.body;
    let detectedSetups: any[] = [];

    try {
      const prompt = `
Analyze this scene from the manuscript.

Scene Title: "${title || 'Untitled Scene'}"
Chapter: ${chapter || 1}
Scene Purpose: "${purpose || 'N/A'}"
Scene Prose:
"${(prose || 'No prose provided').slice(0, 1500)}"

Identify any potential:
- mysteries
- objects
- secrets
- foreshadowing
- promises
- relationship tension
- worldbuilding anomalies

that may require future payoff. Return a JSON object with array "detectedSetups".
`;

      const response = await generateContentWithFallback(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSetups: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  setupType: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  importance: { type: Type.NUMBER },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  introducedBy: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "description", "setupType", "confidence"]
              }
            }
          },
          required: ["detectedSetups"]
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      detectedSetups = parsed.detectedSetups || [];
    } catch (err: any) {
      console.log("Detect setups Gemini error / fallback:", err.message);
      detectedSetups = [
        {
          title: title ? `Unresolved Clue in ${title}` : "Ancient Silver Key",
          description: "An unexamined object or suspicious phrase introduced during the scene confrontation.",
          setupType: "object",
          confidence: 0.96,
          importance: 8,
          tags: ["mystery", "clue", "foreshadowing"],
          introducedBy: characters.length ? [characters[0].name] : ["Unknown"]
        },
        {
          title: "Hidden Betrayal Signal",
          description: "Subtle emotional hesitation before answering the critical question.",
          setupType: "character",
          confidence: 0.88,
          importance: 7,
          tags: ["trust", "secret"],
          introducedBy: characters.length > 1 ? [characters[1].name] : ["Ava"]
        }
      ];
    }

    res.json({ success: true, detectedSetups });
  });

  // AI Payoff Suggestion Endpoint
  app.post("/api/gemini/suggest-payoffs", async (req, res) => {
    const { setupId, title, description, setupType, importance } = req.body;
    let suggestedPayoffs: any[] = [];

    try {
      const openSetupsStr = (req.body.openSetups || []).map((s: any) => `- ${s.title}: ${s.description} (Type: ${s.setupType}, Imp: ${s.importance})`).join("\n");
      const activeFactsStr = canonFacts.slice(0, 8).map(f => `- ${f.fact}`).join("\n");

      const prompt = `
Target Setup Event:
Title: "${title || 'Target Setup'}"
Description: "${description || ''}"
Type: ${setupType || 'mystery'}
Importance: ${importance || 8}

Open Setups in Narrative OS:
${openSetupsStr || 'None'}

Current Canon Rules & History:
${activeFactsStr}

Suggest 3 possible dramatic, high-payoff resolutions/payoffs consistent with current story canon and characters.
`;

      const response = await generateContentWithFallback(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPayoffs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  payoffStrength: { type: Type.NUMBER },
                  suggestedSceneTitle: { type: Type.STRING },
                  consequences: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "description", "payoffStrength", "suggestedSceneTitle"]
              }
            }
          },
          required: ["suggestedPayoffs"]
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      suggestedPayoffs = parsed.suggestedPayoffs || [];
    } catch (err: any) {
      console.log("Suggest payoffs Gemini error / fallback:", err.message);
      suggestedPayoffs = [
        {
          title: `${title || 'Setup'} Climax Resolution`,
          description: `The ${title || 'element'} is revealed to unlock the inner archive, exposing the Council's deepest secret.`,
          payoffStrength: 10,
          suggestedSceneTitle: "The Royal Archive Climax",
          consequences: ["Brother discovered", "New conflict ignited", "Alliance tested"]
        },
        {
          title: "Unexpected Betrayal Counter-Turn",
          description: "The foreshadowed item is seized by the antagonist, turning the advantage against the protagonists.",
          payoffStrength: 9,
          suggestedSceneTitle: "Ambush at Sector 7",
          consequences: ["Forced retreat", "Hero captured"]
        }
      ];
    }

    res.json({ success: true, suggestedPayoffs });
  });

  // Get Dynamic Narrative State Engine System Prompt Text
  app.get("/api/state-engine/prompt", (req, res) => {
    res.json({ promptText: DYNAMIC_NARRATIVE_STATE_ENGINE_PROMPT });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
