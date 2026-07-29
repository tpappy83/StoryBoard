import {
  Character,
  Relationship,
  Scene,
  TimelineEvent,
  PlotThread,
  ConvergenceEvent,
  CanonFact,
  ContinuityViolation,
  ProjectMetadata,
  StructureMilestone
} from '../types';
import { SetupEvent, PayoffEvent } from '../types/setupPayoff';

export const INITIAL_PROJECT: ProjectMetadata = {
  id: 'proj_atlas',
  title: 'Project Atlas: Helios Protocol',
  tagline: 'An ensemble sci-fi political thriller in the shattered Orbit-9 colony.',
  genre: 'Sci-Fi Political Thriller',
  worldSetting: 'Orbit-9 Orbital Citadel & The Abandoned Earth Observatories',
  continuityScore: 96,
  lastAuditTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'char_ava',
    name: 'Ava Ryder',
    role: 'Protagonist',
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    goals: 'Recover the ancient Helios core artifact before the Council purges the outer sectors.',
    detailedGoals: [
      { id: 'g_ava_1', title: 'Recover Helios Core Artifact', priority: 10, status: 'active', obstacle: 'Council Enforcers guarding Vault' },
      { id: 'g_ava_2', title: 'Protect Liam from Council Tracking', priority: 8, status: 'active', obstacle: 'Dormant poison signal' }
    ],
    emotionalState: {
      score: 72,
      mood: 'Stressed / Determined',
    },
    emotionalVector: {
      hope: 75,
      fear: 35,
      anger: 20,
      trust: 68,
      confidence: 82
    },
    trustMap: {
      char_liam: 41,
      char_rowan: 15,
      char_council: -85,
    },
    relationshipVectors: [
      { characterId: 'char_liam', trust: 88, loyalty: 90, fear: 10, affection: 75 },
      { characterId: 'char_rowan', trust: -20, loyalty: 40, fear: 45, affection: 50 },
      { characterId: 'char_council', trust: -95, loyalty: 0, fear: 70, affection: -100 }
    ],
    secrets: [
      'Holds the decryption key to the Helios Genesis Protocol.',
      'Secretly sabotaged the Sector 4 Relay to stall Council tracking.',
      'Possesses forbidden bloodline genetic resonance with the Observatory AI.',
    ],
    memories: [
      { id: 'mem_ava_1', characterId: 'char_ava', title: 'Mother’s Final Transmission', importance: 10, emotionalImpact: 9, chapter: 1, category: 'trauma', description: 'Received Dr. Elena Ryder’s encoded signal before the Observatory went silent.' },
      { id: 'mem_ava_2', characterId: 'char_ava', title: 'Sector 4 Evacuation Victory', importance: 8, emotionalImpact: 7, chapter: 1, category: 'positive', description: 'Guided 120 miners through the collapsing maintenance ducts with Liam.' }
    ],
    arcProgress: 65,
    traits: ['Tactical', 'Suspicious', 'Resilient', 'Tech-Savvy'],
    personality: 'Pragmatic strategist driven by unshakeable familial loyalty and ethical conviction.',
    fears: ['Losing her brother Rowan to darkness', 'Council total purge of outer sectors'],
    beliefs: ['Technology should serve humanity, not control it', 'Trust is earned in blood'],
    skills: ['Quantum Encryption', 'Subterranean Navigation', 'Sidearm Marksmanship'],
    status: 'Active',
  },
  {
    id: 'char_liam',
    name: 'Liam Cross',
    role: 'Deuteragonist',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    goals: 'Infiltrate Council Command and expose the corrupt High Minister.',
    detailedGoals: [
      { id: 'g_liam_1', title: 'Expose High Minister Vane', priority: 9, status: 'active', obstacle: 'High Spire Encryption' }
    ],
    emotionalState: {
      score: 84,
      mood: 'Confident / Calculating',
    },
    emotionalVector: {
      hope: 60,
      fear: 25,
      anger: 65,
      trust: 75,
      confidence: 88
    },
    trustMap: {
      char_ava: 88,
      char_rowan: -30,
      char_council: 20,
    },
    relationshipVectors: [
      { characterId: 'char_ava', trust: 92, loyalty: 95, fear: 5, affection: 80 },
      { characterId: 'char_rowan', trust: -85, loyalty: 10, fear: 60, affection: -40 }
    ],
    secrets: [
      'Former Council Security Officer who deserted during the Siege of Sector 2.',
      'Carries a dormant neurological poison inflicted by Rowan.',
    ],
    memories: [
      { id: 'mem_liam_1', characterId: 'char_liam', title: 'Siege of Sector 2 Betrayal', importance: 10, emotionalImpact: 10, chapter: 1, category: 'trauma', description: 'Watched Rowan lock the armory doors, leaving eighty soldiers behind.' }
    ],
    arcProgress: 50,
    traits: ['Charismatic', 'Deceptive', 'Sharpshooter'],
    personality: 'Battle-hardened veteran hiding deep survivor guilt under dry humor.',
    status: 'Active',
  },
  {
    id: 'char_rowan',
    name: 'Rowan Vale',
    role: 'Antagonist',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    goals: 'Force the convergence of the Helios Protocol to rewrite Citadel governance.',
    detailedGoals: [
      { id: 'g_rowan_1', title: 'Reboot Citadel Governance', priority: 10, status: 'active', obstacle: 'Ava’s resistance' }
    ],
    emotionalState: {
      score: 45,
      mood: 'Isolated / Obsessive',
    },
    emotionalVector: {
      hope: 40,
      fear: 70,
      anger: 80,
      trust: 30,
      confidence: 90
    },
    trustMap: {
      char_ava: 30,
      char_liam: -90,
      char_council: 60,
    },
    secrets: [
      'Discovered the artifact first 3 cycles ago.',
      'Is secretly Ava’s estranged half-brother.',
    ],
    memories: [
      { id: 'mem_rowan_1', characterId: 'char_rowan', title: 'First Sight of the Helios Plasma', importance: 9, emotionalImpact: 8, chapter: 1, category: 'positive', description: 'Witnessed the power of the core in the subterranean vault three cycles ago.' }
    ],
    arcProgress: 80,
    traits: ['Ruthless', 'Visionary', 'Strategist'],
    personality: 'Utilitarian mastermind convinced that extreme measures are the only path to salvation.',
    status: 'Active',
  },
  {
    id: 'char_council',
    name: 'Citadel High Council',
    role: 'Supporting',
    portraitUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    goals: 'Maintain total law and order across Orbit-9 through energy rationing.',
    emotionalState: {
      score: 30,
      mood: 'Paranoid / Authoritarian',
    },
    emotionalVector: {
      hope: 20,
      fear: 85,
      anger: 60,
      trust: 15,
      confidence: 70
    },
    trustMap: {
      char_ava: -100,
      char_liam: -60,
      char_rowan: 50,
    },
    secrets: [
      'The Citadel life-support generators are failing within 12 months.',
    ],
    memories: [],
    arcProgress: 35,
    traits: ['Bureaucratic', 'Implacable', 'Resource-Rich'],
    status: 'Active',
  }
];

export const INITIAL_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel_1',
    sourceCharId: 'char_ava',
    targetCharId: 'char_liam',
    type: 'Alliance',
    trustScore: 78,
    intensity: 8,
    history: 'Fought together during the Sector 4 evacuation. Shared trauma built guarded mutual rely.',
  },
  {
    id: 'rel_2',
    sourceCharId: 'char_ava',
    targetCharId: 'char_rowan',
    type: 'Hidden',
    trustScore: -40,
    intensity: 9,
    history: 'Estranged siblings keeping familial ties hidden from both Council and rebels.',
  },
  {
    id: 'rel_3',
    sourceCharId: 'char_liam',
    targetCharId: 'char_rowan',
    type: 'Conflict',
    trustScore: -92,
    intensity: 10,
    history: 'Bitter rivalry stemming from the betrayal at the Lower Deck Armory.',
  },
  {
    id: 'rel_4',
    sourceCharId: 'char_rowan',
    targetCharId: 'char_council',
    type: 'Tension',
    trustScore: 45,
    intensity: 6,
    history: 'Uneasy alliance; Council hires Rowan as covert operator while distrusting his ambition.',
  }
];

export const INITIAL_PLOT_THREADS: PlotThread[] = [
  {
    id: 'thread_war',
    name: 'Sector 4 Resistance War',
    status: 'Active',
    setup: 'Rebel factions form in the lower maintenance tiers of Citadel.',
    escalation: 'Council deploys enforcer legions to seal Sector boundaries.',
    payoff: 'Full-scale breach during the annual Citadel Solstice Assembly.',
    color: '#6D8CFF',
  },
  {
    id: 'thread_coup',
    name: 'High Council Political Coup',
    status: 'Active',
    setup: 'Minister Vane gathers votes to declare martial law.',
    escalation: 'Liam leaks forged security logs accusing Vane of high treason.',
    payoff: 'Dissolution of the High Council leadership.',
    color: '#8B5CF6',
  },
  {
    id: 'thread_artifact',
    name: 'The Lost Helios Core',
    status: 'Active',
    setup: 'An alien power source detected in the Earth Abandoned Observatory.',
    escalation: 'Ava and Rowan race to retrieve the core’s core key.',
    payoff: 'Activation of Earth restoration matrix.',
    color: '#22C55E',
  },
  {
    id: 'thread_bloodline',
    name: 'Ryder Family Legacy',
    status: 'Dormant',
    setup: 'Ava finds classified genetic archives listing shared lineage with Rowan.',
    escalation: 'Confrontation over their mother’s disappearance.',
    payoff: 'Siblings forced into joint decision over Citadel’s fate.',
    color: '#F59E0B',
  }
];

export const INITIAL_CONVERGENCE_EVENTS: ConvergenceEvent[] = [
  {
    id: 'conv_observatory',
    name: 'The Abandoned Observatory Summit',
    connectingThreadIds: ['thread_artifact', 'thread_bloodline'],
    targetOutcome: 'Ava and Rowan meet face-to-face; Helios decryption starts.',
    status: 'In-Progress',
  },
  {
    id: 'conv_finale',
    name: 'The Citadel Solstice Siege',
    connectingThreadIds: ['thread_war', 'thread_coup', 'thread_artifact'],
    targetOutcome: 'Citadel power grid fails; ultimate choice between Earth return or Citadel reboot.',
    status: 'Pending',
  }
];

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'sc_01',
    chapter: 1,
    padIndex: 1,
    title: 'Echoes in Sector 4',
    location: 'Sector 4 Lower Maintenance Tiers',
    participantIds: ['char_ava', 'char_liam'],
    purpose: 'Introduce Ava and Liam navigating Council patrol lockdown.',
    status: 'Approved',
    prose: 'The damp air smelled of ozone and scorched copper. Ava crouched behind the hydraulic press, her pulse thumping against her ribs. Next to her, Liam adjusted his visor, the faint blue glow illuminating his stern jaw.\n\n"Patrol passes in twelve seconds," Liam whispered. "If we hit the relay now, we lose our escape vector."\n\nAva touched the glowing key in her jacket pocket. "We don\'t have twelve seconds, Liam. The Council already knows the core signature is awake."',
    expectedConsequences: ['Ava reveals she has the decryption key.', 'Liam agrees to cover her flank.'],
    timelinePhase: 1,
    wordCount: 184,
    threadId: 'thread_war',
  },
  {
    id: 'sc_02',
    chapter: 1,
    padIndex: 2,
    title: 'The Minister’s Ultimatum',
    location: 'Citadel High Chamber',
    participantIds: ['char_rowan', 'char_council'],
    purpose: 'Show Rowan bargaining with the Council for extra tactical assets.',
    status: 'Approved',
    prose: 'High Minister Vane leaned forward across the obsidian desk. "You guarantee the girl won\'t reach the surface, Vale?"\n\nRowan didn\'t blink. "Ava is resilient, but predictable. Give me three strike teams and override authorization for the Observatory lift. I\'ll bring you the Helios core intact."',
    expectedConsequences: ['Rowan gains clearance to the surface lift.', 'Council places tracker on Rowan.'],
    timelinePhase: 2,
    wordCount: 142,
    threadId: 'thread_coup',
  },
  {
    id: 'sc_03',
    chapter: 2,
    padIndex: 3,
    title: 'Surface Descent',
    location: 'Orbital Elevator Shaft 09',
    participantIds: ['char_ava', 'char_liam'],
    purpose: 'Tension during surface elevator drop; reveal Liam’s past military record.',
    status: 'Approved',
    prose: 'The elevator shuddered as it descended through the heavy cloud layer. Below lay the forgotten crags of the old continent. Liam stared into the blackness.\n\n"I dropped here six years ago," he said quietly. "During the Siege. We left eighty men behind, Ava."\n\nAva placed a hand on his shoulder. "This time we aren\'t leaving anyone."',
    expectedConsequences: ['Trust between Ava and Liam increases (+15).', 'Coordinates to Observatory locked.'],
    timelinePhase: 3,
    wordCount: 156,
    threadId: 'thread_artifact',
  },
  {
    id: 'sc_04',
    chapter: 2,
    padIndex: 4,
    title: 'The Abandoned Observatory',
    location: 'Earth Surface - Old Astronomical Vault',
    participantIds: ['char_ava', 'char_rowan'],
    purpose: 'Confrontation over the Helios Artifact and family disclosure.',
    status: 'Pending',
    prose: 'Dust motes floated in the pale moonlight filtering through the shattered glass dome. In the center of the chamber rested the Helios Core—a suspended sphere of pulsing gold plasma.\n\n"You were always late, Ava," a voice echoed from the shadows.\n\nRowan stepped forward, his sidearm holstered, hands open. "Our mother spent twenty years guarding this vault. Do you even know what it does?"',
    expectedConsequences: ['Rowan reveals mother’s secret diary.', 'Continuity check required for weapon availability.'],
    timelinePhase: 4,
    wordCount: 210,
    threadId: 'thread_artifact',
  },
  {
    id: 'sc_05',
    chapter: 3,
    padIndex: 5,
    title: 'The Council Betrayal',
    location: 'Citadel Communications Spire',
    participantIds: ['char_liam', 'char_council'],
    purpose: 'Liam attempts data broadcast while Council forces storm the spire.',
    status: 'Drafted',
    prose: 'Terminal lights flashed red as encryption bars filled the display. Liam jammed his palm onto the override pad. "Five more seconds..."\n\nThe heavy blast doors hissed open. Enforcers poured in, weapons raised.',
    expectedConsequences: ['Broadcast partially sent.', 'Liam captured or injured.'],
    timelinePhase: 5,
    wordCount: 98,
    threadId: 'thread_coup',
  },
  {
    id: 'sc_06',
    chapter: 3,
    padIndex: 6,
    title: 'The Convergence Pact',
    location: 'Observatory Sub-Basement',
    participantIds: ['char_ava', 'char_liam', 'char_rowan'],
    purpose: 'All three main characters converge when Council airships arrive overhead.',
    status: 'Convergence',
    prose: 'The earth shook as Council gunships thundered through the storm outside. Ava stood between Liam and Rowan, her hand hovering over the core activator.\n\n"We either unite the frequencies right now," she declared, "or Vane glassing this entire ridge in two minutes."',
    expectedConsequences: ['Temporary truce forged.', 'Convergence event triggered.'],
    timelinePhase: 6,
    wordCount: 175,
    threadId: 'thread_artifact',
  }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt_1',
    timestampLabel: 'Cycle 289.01',
    phase: 1,
    layer: 'Military',
    description: 'Council locks down Sector 4 following anomalous power spikes.',
    involvedCharIds: ['char_council', 'char_ava'],
    conflictStatus: 'Valid',
  },
  {
    id: 'evt_2',
    timestampLabel: 'Cycle 289.04',
    phase: 2,
    layer: 'Political',
    description: 'Rowan Vale granted Surface Lift Clearance by High Minister Vane.',
    involvedCharIds: ['char_rowan', 'char_council'],
    conflictStatus: 'Valid',
  },
  {
    id: 'evt_3',
    timestampLabel: 'Cycle 289.08',
    phase: 3,
    layer: 'Character',
    description: 'Ava and Liam descend in Elevator Shaft 09 to the Earth Observatory.',
    involvedCharIds: ['char_ava', 'char_liam'],
    conflictStatus: 'Valid',
  },
  {
    id: 'evt_4',
    timestampLabel: 'Cycle 289.12',
    phase: 4,
    layer: 'Magic',
    description: 'Helios Core pulse detected at the surface; signal triggers Citadel secondary alarms.',
    involvedCharIds: ['char_ava', 'char_rowan'],
    conflictStatus: 'Valid',
  },
  {
    id: 'evt_5',
    timestampLabel: 'Cycle 289.15',
    phase: 5,
    layer: 'Political',
    description: 'Liam Cross attempts broadcast from Spire; Council orders orbital strike warning.',
    involvedCharIds: ['char_liam', 'char_council'],
    conflictStatus: 'Violation',
    violationDetails: 'Timeline overlap: Liam is logged in Orbital Elevator Shaft 09 at Cycle 289.08 and appears in Spire at 289.15 without travel transit log.',
  }
];

export const INITIAL_CANON_FACTS: CanonFact[] = [
  {
    id: 'fact_1',
    category: 'Lore',
    fact: 'The Helios Core requires both the Physical Decryption Key and Bloodline Genetic Resonance to fully activate.',
    sourceSceneId: 'sc_01',
    confidence: 100,
    contentHash: 'a7b3c9f1e0',
    createdAt: '2026-07-28 10:14',
  },
  {
    id: 'fact_2',
    category: 'History',
    fact: 'The Siege of Sector 2 occurred six years ago; Liam Cross served in the 4th Vanguard Division before deserting.',
    sourceSceneId: 'sc_03',
    confidence: 98,
    contentHash: 'f4d8e2c90a',
    createdAt: '2026-07-28 11:20',
  },
  {
    id: 'fact_3',
    category: 'Rule',
    fact: 'Orbital Elevator Shaft 09 descent takes a minimum of 4 hours transit time between Citadel and Earth surface.',
    sourceSceneId: 'sc_03',
    confidence: 100,
    contentHash: 'c2b1a9e87d',
    createdAt: '2026-07-28 12:05',
  },
  {
    id: 'fact_4',
    category: 'Lore',
    fact: 'Ava Ryder and Rowan Vale are half-siblings sharing their mother Dr. Elena Ryder’s genetic heritage.',
    sourceSceneId: 'sc_04',
    confidence: 95,
    contentHash: 'e9a1b2c3d4',
    createdAt: '2026-07-28 13:40',
  },
  {
    id: 'fact_5',
    category: 'Magic',
    fact: 'Helios Golden Plasma emits non-lethal electromagnetic pulses that disable Council laser weapon targeting.',
    sourceSceneId: 'sc_04',
    confidence: 90,
    contentHash: 'd3c2b1a0f9',
    createdAt: '2026-07-28 14:15',
  }
];

export const INITIAL_VIOLATIONS: ContinuityViolation[] = [
  {
    id: 'viol_1',
    severity: 'High',
    ruleName: 'Transit Time & Spatial Teleportation Conflict',
    details: 'Scene #5 places Liam Cross at the Citadel Communications Spire at Cycle 289.15, but Scene #3 placed him in Elevator Shaft 09 going down to Earth at 289.08. Minimum descent + return transit time is 8 hours.',
    affectedSceneId: 'sc_05',
    affectedCharIds: ['char_liam'],
    suggestedFix: 'Shift Scene #5 to a remote broadcast relay on the surface, or insert a 12-hour gap between surface return and Spire infiltration.',
    resolved: false,
  },
  {
    id: 'viol_2',
    severity: 'Warning',
    ruleName: 'Knowledge Paradox - Decryption Key',
    details: 'In Scene #2 Rowan tells Council Vane that Ava does not know how to unlock the Helios Core, but Canon Fact #1 records Ava already unlocked the encryption key in Chapter 1.',
    affectedSceneId: 'sc_02',
    affectedCharIds: ['char_rowan', 'char_council'],
    suggestedFix: 'Mark Rowan’s dialogue as intentional deception towards Council Vane rather than a factual knowledge error.',
    resolved: false,
  }
];

export const INITIAL_STRUCTURE_MILESTONES: StructureMilestone[] = [
  { id: 'm1', name: 'Inciting Incident (Sector 4 Purge)', phase: 1, framework: '3-Act', description: 'Council forces lock down Sector 4; Ava finds Helios key.', targetPercentage: 12, status: 'achieved' },
  { id: 'm2', name: 'Plot Point 1 / Door Into Act 2', phase: 2, framework: '3-Act', description: 'Ava & Liam board Elevator Shaft 09 to descend to Earth surface.', targetPercentage: 25, status: 'achieved' },
  { id: 'm3', name: 'Midpoint Confrontation (Observatory Vault)', phase: 3, framework: '3-Act', description: 'Face-to-face standoff between Ava and Rowan at the Helios plasma sphere.', targetPercentage: 50, status: 'current' },
  { id: 'm4', name: 'All Is Lost / Dark Night of Soul', phase: 4, framework: '3-Act', description: 'Council fleet arrives overhead; Liam captured at Spire.', targetPercentage: 75, status: 'pending' },
  { id: 'm5', name: 'Climax & Resolution (Solstice Assembly Reboot)', phase: 5, framework: '3-Act', description: 'Ensemble convergence at Citadel power grid.', targetPercentage: 90, status: 'pending' }
];

export const INITIAL_SETUPS: SetupEvent[] = [
  {
    id: "sup_001",
    title: "Ancient Silver Key",
    description: "Mysterious key found inside observatory with royal crest.",
    setupType: "object",
    status: "open",
    importance: 9,
    introducedSceneId: "scene_003",
    introducedChapterId: "chapter_4",
    introducedActId: "act_1",
    introducedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    introducedBy: ["Elara", "Ava"],
    tags: ["key", "vault", "mystery"],
    linkedPayoffIds: [],
    notes: "Ava keeps the key in her tactical jacket pocket."
  },
  {
    id: "sup_002",
    title: "Dormant Neurological Poison Code",
    description: "Subdermal override sequence encoded into Liam's neural dampener.",
    setupType: "foreshadowing",
    status: "open",
    importance: 8,
    introducedSceneId: "scene_001",
    introducedChapterId: "chapter_1",
    introducedActId: "act_1",
    introducedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    introducedBy: ["Rowan"],
    tags: ["poison", "implant", "betrayal"],
    linkedPayoffIds: [],
    notes: "Rowan holds the trigger code secretly."
  },
  {
    id: "sup_003",
    title: "Dr. Elena Ryder's Vault Diary",
    description: "Mentions bloodline resonance frequency required to open Sector 7 breach door.",
    setupType: "mystery",
    status: "open",
    importance: 7,
    introducedSceneId: "scene_002",
    introducedChapterId: "chapter_2",
    introducedActId: "act_1",
    introducedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    introducedBy: ["Elara"],
    tags: ["lore", "vault", "bloodline"],
    linkedPayoffIds: [],
    notes: "Discovered under the floorboards of the abandoned observatory."
  },
  {
    id: "sup_004",
    title: "Subterranean Maintenance Override Key",
    description: "Standard industrial keycard for orbital elevator shaft 09.",
    setupType: "object",
    status: "resolved",
    importance: 5,
    introducedSceneId: "scene_001",
    introducedChapterId: "chapter_1",
    introducedActId: "act_1",
    introducedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    introducedBy: ["Ava"],
    tags: ["elevator", "keycard"],
    linkedPayoffIds: ["pay_001"],
    notes: "Used to bypass elevator Lockdown Mode during descent."
  }
];

export const INITIAL_PAYOFFS: PayoffEvent[] = [
  {
    id: "pay_001",
    title: "Orbital Elevator Shaft 09 Unlocked",
    description: "Ava swiped the subterranean override key card just as the security grid engaged, allowing the party to escape into Sector 4.",
    payoffStrength: 8,
    sceneId: "scene_002",
    chapterId: "chapter_2",
    actId: "act_1",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    setupIds: ["sup_004"],
    consequences: ["Escaped Sector 4 quarantine zone", "Damaged elevator drive gears"]
  }
];
