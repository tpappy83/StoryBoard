export type CharacterRole = 'Protagonist' | 'Antagonist' | 'Supporting' | 'Deuteragonist' | 'Mentor';
export type CharacterStatus = 'Active' | 'Deceased' | 'Missing' | 'Captured' | 'Exiled';

export interface EmotionalStateVector {
  hope: number; // 0 to 100
  fear: number; // 0 to 100
  anger: number; // 0 to 100
  trust: number; // 0 to 100
  confidence: number; // 0 to 100
}

export interface CharacterGoal {
  id: string;
  title: string;
  priority: number; // 1 to 10
  status: 'active' | 'blocked' | 'completed';
  obstacle?: string;
}

export interface CharacterRelationshipVector {
  characterId: string;
  trust: number; // -100 to 100
  loyalty: number; // 0 to 100
  fear: number; // 0 to 100
  affection: number; // -100 to 100
}

export interface CharacterMemory {
  id: string;
  characterId: string;
  title: string;
  importance: number; // 1 to 10
  emotionalImpact: number; // 1 to 10
  chapter: number;
  category: 'trauma' | 'positive' | 'neutral';
  description: string;
}

export interface Character {
  createdAt?: string;
  updatedAt?: string;
  demographics?: {
    age?: number | string;
    gender?: string;
    ethnicity?: string;
  };
  notes?: string;
  summary?: string;
  firstAppearanceSceneId?: string;
  id: string;
  name: string;
  role: CharacterRole;
  portraitUrl?: string;
  goals: string;
  detailedGoals?: CharacterGoal[];
  emotionalState: {
    score: number; // 0 to 100
    mood: string;
  };
  emotionalVector?: EmotionalStateVector;
  trustMap: Record<string, number>; // charId -> trust level (-100 to 100)
  relationshipVectors?: CharacterRelationshipVector[];
  secrets: string[];
  arcProgress: number; // 0 to 100
  traits: string[];
  status: CharacterStatus;
  personality?: string;
  fears?: string[];
  beliefs?: string[];
  skills?: string[];
  knowledge?: string[];
  memories?: CharacterMemory[];
}

export type RelationshipType = 'Alliance' | 'Conflict' | 'Hidden' | 'Family' | 'Mentor' | 'Tension' | 'Rivalry';

export interface Relationship {
  id: string;
  sourceCharId: string;
  targetCharId: string;
  type: RelationshipType;
  trustScore: number; // -100 to 100
  intensity: number; // 1 to 10
  history: string;
  historyLog?: { date: string; trustScore: number; note: string }[];
}

export type SceneStatus = 'Drafted' | 'Approved' | 'Pending' | 'Violation' | 'Convergence';

export interface Scene {
  createdAt?: string;
  updatedAt?: string;
  order?: number;
  notes?: string;
  charactersReferenced?: string[];
  fullContent?: string;
  id: string;
  chapter: number;
  padIndex: number; // 1 to 16
  title: string;
  location: string;
  participantIds: string[];
  purpose: string;
  status: SceneStatus;
  prose: string;
  expectedConsequences: string[];
  timelinePhase: number;
  wordCount: number;
  threadId?: string;
}

export type TimelineLayer = 'Character' | 'Political' | 'Military' | 'Magic';

export interface TimelineEvent {
  id: string;
  timestampLabel: string;
  phase: number; // 1 to 10
  layer: TimelineLayer;
  description: string;
  involvedCharIds: string[];
  conflictStatus: 'Valid' | 'Violation';
  violationDetails?: string;
}

export type ThreadCategory = 'Mystery' | 'Romance' | 'Political' | 'Revenge' | 'Worldbuilding' | 'Character Arc';

export interface PlotThread {
  id: string;
  name: string;
  status: 'Active' | 'Dormant' | 'Resolved';
  setup: string;
  escalation: string;
  payoff: string;
  convergenceEventId?: string;
  color: string;
  introducedChapter?: number;
  lastSeenChapter?: number;
  importance?: number;
  threadCategory?: ThreadCategory;
  isStale?: boolean;
}

export interface SetupPayoffItem {
  id: string;
  item: string;
  category: 'Foreshadowing' | 'Prop' | 'Secret' | 'Promise' | 'Symbol';
  introducedChapter: number;
  introducedSceneTitle: string;
  resolved: boolean;
  payoffChapter?: number;
  payoffSceneTitle?: string;
  notes: string;
}

export interface ConvergenceEvent {
  id: string;
  name: string;
  connectingThreadIds: string[];
  targetOutcome: string;
  status: 'Pending' | 'Resolved' | 'In-Progress';
}

export type CanonCategory = 'Lore' | 'Fact' | 'Rule' | 'Magic' | 'History';

export interface CanonFact {
  id: string;
  category: CanonCategory;
  fact: string;
  sourceSceneId?: string;
  confidence: number; // 0 - 100
  contentHash: string;
  createdAt: string;
}

export interface ContinuityViolation {
  id: string;
  severity: 'High' | 'Warning' | 'Info';
  ruleName: string;
  details: string;
  affectedSceneId?: string;
  affectedCharIds?: string[];
  suggestedFix: string;
  resolved: boolean;
}

export interface StateChangeProposal {
  charId: string;
  charName: string;
  field: string; // e.g. "Emotional State", "Trust in Liam", "Goal"
  oldValue: string | number;
  newValue: string | number;
}

export interface SceneProposal {
  id: string;
  sceneId: string;
  title: string;
  location: string;
  participants: string[];
  purpose: string;
  prose: string;
  proposedStateChanges: StateChangeProposal[];
  proposedCanonFacts: string[];
  validationChecks: {
    check: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    note: string;
  }[];
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export type MemoryLayerLevel = 'Universe' | 'Series' | 'Book' | 'Act' | 'Chapter' | 'Scene';

export interface HierarchicalStoryMemory {
  id: string;
  level: MemoryLayerLevel;
  label: string;
  summary: string;
  keyCharacters: string[];
  locations: string[];
  themes: string[];
  facts: string[];
  openThreads: string[];
}

export interface IntersectionCollision {
  id: string;
  charIds: string[];
  convergenceScore: number; // 0 to 100
  sharedThemes: string[];
  sharedLocations: string[];
  sharedCharacters: string[];
  conflictingGoals: string[];
  recommendedCollisionTitle: string;
  recommendedPrompt: string;
}

export type StructureFramework = '3-Act' | '5-Act' | 'Save The Cat' | 'Hero Journey' | 'Ensemble Network';

export interface StructureMilestone {
  id: string;
  name: string;
  phase: number;
  framework: StructureFramework;
  description: string;
  targetPercentage: number;
  status: 'achieved' | 'current' | 'pending';
  associatedSceneId?: string;
}

export type WritersRoomRole = 'Story Architect' | 'Character Psychologist' | 'Lore Guardian' | 'Plot Engineer' | 'Continuity Inspector';

export interface AgentFeedback {
  agentRole: WritersRoomRole;
  avatarUrl?: string;
  assessment: string;
  suggestions: string[];
  score: number; // 0-100
  statusFlag: 'OPTIMAL' | 'ATTENTION' | 'CRITICAL';
}

export interface OffscreenSimTick {
  id: string;
  charId: string;
  charName: string;
  currentLocation: string;
  offscreenActivity: string;
  resultingStateChange: string;
  updatedGoalStatus?: string;
  timestamp: string;
}

export type WorkspaceMode = 
  | 'WRITING' 
  | 'WRITING_STUDIO'
  | 'PLANNING' 
  | 'CONTINUITY' 
  | 'WORLDBUILDING' 
  | 'CHARACTER' 
  | 'SIMULATION' 
  | 'CUSTOM';

export type PresetMode = WorkspaceMode;

export type NarrativeObjectType = 
  | 'character' 
  | 'relationship' 
  | 'scene' 
  | 'location' 
  | 'timeline' 
  | 'plot_thread' 
  | 'character_arc' 
  | 'theme' 
  | 'canon_fact' 
  | 'memory' 
  | 'revision' 
  | 'setup' 
  | 'payoff'
  | 'convergence_event';

export interface SelectedNarrativeObject {
  type: NarrativeObjectType;
  id: string;
  data: any;
}

export interface CharacterChangeResult {
  charId: string;
  charName: string;
  learnedInfo?: string;
  trustShift?: string;
  emotionalStateChange?: string;
  goalShift?: string;
  beliefShift?: string;
  relationshipShift?: string;
  memoryCreated?: string;
}

export interface ConsequenceBreakdown {
  characterConsequences: string[];
  relationshipConsequences: string[];
  worldConsequences: string[];
  politicalConsequences: string[];
  emotionalConsequences: string[];
  plotConsequences: string[];
}

export interface SetupPayoffEvent {
  title: string;
  type: 'Setup' | 'Payoff';
  chapter: number;
  importance: number;
  relatedCharacters: string[];
  notes: string;
}

export interface StateEngineSimulationResult {
  sceneSummary: string;
  characterChanges: CharacterChangeResult[];
  relationshipChanges: string[];
  plotThreadUpdates: {
    threadId: string;
    threadName: string;
    status: 'Open' | 'Active' | 'Escalating' | 'Stalled' | 'Resolved';
    progressNotes: string;
  }[];
  newMemoriesCreated: {
    characterName: string;
    memoryTitle: string;
    category: 'trauma' | 'positive' | 'neutral';
    importance: number;
    description: string;
  }[];
  setupPayoffEvents: SetupPayoffEvent[];
  timelineChanges: string[];
  canonUpdates: string[];
  narrativeConsequences: ConsequenceBreakdown;
  futureOpportunities: string[];
  thinkingSteps?: ThinkingStep[];
}

export interface ThinkingStep {
  step: number;
  phase: 'Memory Recall' | 'Canon Check' | 'Psychological Alignment' | 'Continuity Validation' | 'Synthesis';
  thought: string;
}

export interface AiReasoningLog {
  modelName: string;
  thinkingBudget: number;
  thinkingSteps: ThinkingStep[];
  conclusion: string;
}

export interface PanelDockState {
  id: string;
  title: string;
  isFloating: boolean;
  isCollapsed: boolean;
  isMaximized: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface ProjectMetadata {
  createdAt?: string;
  updatedAt?: string;
  lastSync?: string;
  episodeId?: string;
  currentSceneId?: string;
  currentCharacterId?: string;
  autoSaveEnabled?: boolean;
  autoSyncEnabled?: boolean;
  id: string;
  title: string;
  tagline: string;
  genre: string;
  worldSetting: string;
  continuityScore: number; // e.g. 96
  lastAuditTime: string;
  thinkingEnabled?: boolean;
}
