export type SetupType =
  | "object"
  | "character"
  | "relationship"
  | "mystery"
  | "theme"
  | "foreshadowing"
  | "worldbuilding";

export type SetupStatus =
  | "open"
  | "partial"
  | "resolved";

export interface SetupEvent {
  id: string;
  title: string;
  description: string;
  setupType: SetupType;
  status: SetupStatus;
  importance: number;
  introducedSceneId: string;
  introducedChapterId?: string;
  introducedActId?: string;
  introducedAt: string;
  introducedBy: string[];
  tags: string[];
  linkedPayoffIds: string[];
  notes?: string;
}

export interface PayoffEvent {
  id: string;
  title: string;
  description: string;
  payoffStrength: number;
  sceneId: string;
  chapterId?: string;
  actId?: string;
  createdAt: string;
  setupIds: string[];
  consequences?: string[];
}

export function getSetupAge(
  setup: SetupEvent,
  currentChapter: number
): number {
  if (!setup.introducedChapterId) return 0;
  const chapterNum = Number(
    setup.introducedChapterId.toString().replace(/[^0-9]/g, '')
  );
  if (isNaN(chapterNum) || chapterNum === 0) return 0;
  return Math.max(0, currentChapter - chapterNum);
}

export function calculateNarrativeDebt(
  setups: SetupEvent[]
): number {
  return setups
    .filter(s => s.status !== "resolved")
    .reduce((sum, setup) => sum + (setup.importance || 1), 0);
}

export function isChekhovWarning(
  setup: SetupEvent,
  currentChapter: number,
  importanceThreshold: number = 7,
  chapterAgeThreshold: number = 20
): boolean {
  if (setup.status === 'resolved') return false;
  if (setup.linkedPayoffIds && setup.linkedPayoffIds.length > 0) return false;
  const age = getSetupAge(setup, currentChapter);
  const importance = setup.importance || 0;
  return age >= chapterAgeThreshold && importance >= importanceThreshold;
}

export function getChekhovWarnings(
  setups: SetupEvent[],
  currentChapter: number,
  importanceThreshold: number = 7,
  chapterAgeThreshold: number = 20
): SetupEvent[] {
  return setups.filter(s => isChekhovWarning(s, currentChapter, importanceThreshold, chapterAgeThreshold));
}

