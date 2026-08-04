const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf8');

const now = new Date().toISOString();

// Patch Project
code = code.replace(
  "lastAuditTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),",
  "lastAuditTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),\n  createdAt: '2026-07-20T10:00:00Z',\n  updatedAt: '2026-08-04T08:30:00Z',\n  lastSync: '2026-08-04T08:31:00Z',\n  episodeId: 'ep_01_pilot',\n  currentSceneId: 'sc_03',\n  currentCharacterId: 'char_ava',\n  autoSaveEnabled: true,\n  autoSyncEnabled: true,"
);

// Patch Characters
code = code.replace(/id: 'char_ava',[\s\S]*?name: 'Ava Ryder',[\s\S]*?role: 'Protagonist',/g, 
  "id: 'char_ava',\n    name: 'Ava Ryder',\n    role: 'Protagonist',\n    demographics: { age: 28, gender: 'Female', ethnicity: 'Terran' },\n    summary: 'A rogue cryptographer seeking to disable the Citadel network.',\n    notes: 'Primary emotional arc revolves around her brother.',\n    firstAppearanceSceneId: 'sc_01',\n    createdAt: '2026-07-20T10:00:00Z',\n    updatedAt: '2026-08-04T08:30:00Z',"
);

code = code.replace(/id: 'char_liam',[\s\S]*?name: 'Liam Cross',[\s\S]*?role: 'Deuteragonist',/g, 
  "id: 'char_liam',\n    name: 'Liam Cross',\n    role: 'Deuteragonist',\n    demographics: { age: 34, gender: 'Male', ethnicity: 'Martian' },\n    summary: 'A disillusioned ex-Vanguard soldier turned mercenary.',\n    notes: 'Struggles with PTSD from the Siege of Sector 2.',\n    firstAppearanceSceneId: 'sc_01',\n    createdAt: '2026-07-20T10:00:00Z',\n    updatedAt: '2026-08-04T08:30:00Z',"
);

code = code.replace(/id: 'char_rowan',[\s\S]*?name: 'Rowan Vale',[\s\S]*?role: 'Antagonist',/g, 
  "id: 'char_rowan',\n    name: 'Rowan Vale',\n    role: 'Antagonist',\n    demographics: { age: 31, gender: 'Male', ethnicity: 'Terran' },\n    summary: 'Council Enforcer and Ava\\'s estranged half-brother.',\n    notes: 'Believes order is more important than freedom.',\n    firstAppearanceSceneId: 'sc_02',\n    createdAt: '2026-07-20T10:00:00Z',\n    updatedAt: '2026-08-04T08:30:00Z',"
);

code = code.replace(/id: 'char_council',[\s\S]*?name: 'Citadel High Council',[\s\S]*?role: 'Supporting',/g, 
  "id: 'char_council',\n    name: 'Citadel High Council',\n    role: 'Supporting',\n    demographics: { age: 'N/A', gender: 'Mixed', ethnicity: 'Various' },\n    summary: 'The authoritarian ruling body of Orbit-9.',\n    notes: 'Operates entirely from the Spire.',\n    firstAppearanceSceneId: 'sc_02',\n    createdAt: '2026-07-20T10:00:00Z',\n    updatedAt: '2026-08-04T08:30:00Z',"
);


// Patch Scenes
const scenesRegex = /id: '(sc_\d+)',[\s\S]*?padIndex: (\d+),/g;
let match;
while ((match = scenesRegex.exec(code)) !== null) {
  const sceneId = match[1];
  const padIndex = match[2];
  code = code.replace(
    new RegExp(`id: '${sceneId}',[\\s\\S]*?padIndex: ${padIndex},`),
    `id: '${sceneId}',
    chapter: 1,
    padIndex: ${padIndex},
    order: ${padIndex},
    createdAt: '2026-07-21T12:00:00Z',
    updatedAt: '2026-08-04T08:30:00Z',
    notes: 'Needs revision for pacing.',`
  );
}

fs.writeFileSync('src/data/initialData.ts', code);
console.log("Mock data patched with all required metadata fields");
