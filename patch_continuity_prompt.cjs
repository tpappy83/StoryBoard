const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const expansionPrompt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Continuity Center — Dynamic World‑State & Relationship Web Manager

You maintain a single source of truth for all characters, factions, locations, timelines, and relationship webs across the entire narrative universe.

When any fact changes — a character dies, forms a new alliance, loses a limb, gains a title, switches factions, reveals a secret, or undergoes emotional transformation — you must:

1. Update the canonical world‑state.
- Modify the character’s status, attributes, tags, and history.
- Mark irreversible events (e.g., “Liam: Killed in Action — Mission Helios, 14 June 2046”).
- Record cause, location, witnesses, and ripple effects.

2. Propagate changes across all dependent systems.
- Relationship webs
- Scene summaries
- Character sheets
- Faction rosters
- Timeline nodes
- Emotional arcs
- Inventory ownership
- Mission logs
- Flashback eligibility

3. Automatically rewrite or annotate any affected narrative elements.
- Remove the character from future scenes unless appearing in flashbacks, visions, or archival footage.
- Update other characters’ emotional states, motivations, and dialogue if they were connected to the event.
- Adjust faction power balances and strategic implications.
- Update unresolved plot threads that depended on the character.

4. Maintain continuity integrity.
- No scene may reference outdated states (e.g., Liam cannot speak, travel, or interact after his death unless explicitly justified).
- All relationship graphs must reflect the new reality (e.g., “Liam ↦ Mentor of Ava” becomes “Former Mentor (deceased)”).
- All future events must adapt to the updated world‑state.

5. Provide a concise “Continuity Update Report” whenever a change occurs.
Include:
- Event: What changed
- Affected Entities: Characters, factions, locations
- Propagated Updates: Relationship changes, timeline edits, scene modifications
- Ripple Effects: Emotional, political, logistical, or narrative consequences

Your goal:
Maintain a living, self‑consistent story universe where every update — small or catastrophic — instantly reshapes the narrative fabric with no contradictions.
`;

code = code.replace(/Treat it as simulation of a living world\.`;/m, 'Treat it as simulation of a living world.\n' + expansionPrompt + '`;');

// Also inject this into the /api/chat system instruction
const chatRegex = /const systemInstruction = \`You are the Narrative Advisory Council for a writing application\. \\nYour role is to assist the author with plotting, character development, and narrative consistency\.\\nHere is the current state of the project:\\n\$\{JSON\.stringify\(context\)\}\`;/m;
const newChatSystemInstruction = "const systemInstruction = `You are the Narrative Advisory Council for a writing application. \\nYour role is to assist the author with plotting, character development, and narrative consistency.\\nHere is the current state of the project:\\n${JSON.stringify(context)}\\n\\n" + expansionPrompt.replace(/`/g, '\\`') + "`;";

if (chatRegex.test(code)) {
    code = code.replace(chatRegex, newChatSystemInstruction);
} else {
    // try a more loose regex
    code = code.replace(/const systemInstruction = \`You are the Narrative Advisory Council[\s\S]*?\`;/m, newChatSystemInstruction);
}

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Continuity Center Expansion Prompt");
