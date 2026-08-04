import { Character, Scene, Relationship, PlotThread, CanonFact, TimelineEvent, ConvergenceEvent, NarrativeObjectType } from '../types';

export type { NarrativeObjectType };

export interface NarrativeDragPayload {
  objectType: NarrativeObjectType;
  objectId: string;
  label: string;
  sourcePanelId?: string;
  metadata?: Record<string, unknown>;
  data?: any;
}

export interface NarrativeDropContext {
  characters: Character[];
  scenes: Scene[];
  relationships: Relationship[];
  plotThreads: PlotThread[];
  canonFacts: CanonFact[];
  timelineEvents: TimelineEvent[];
  convergenceEvents: ConvergenceEvent[];
  selectedProjectId?: string;
}

export type OperationType =
  | 'createRelationship'
  | 'linkCharacterToScene'
  | 'linkCanonToScene'
  | 'moveSceneToTimeline'
  | 'attachThreadToScene'
  | 'createConvergenceLink'
  | 'updateSceneLocation'
  | 'openContextDialog'
  | 'createProposal';

export interface ProposedChange {
  title: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  relationshipTensions?: string[];
  warnings?: string[];
  payloadData?: any;
}

export type NarrativeDropResult =
  | {
      status: 'accepted';
      operationType: OperationType;
      message: string;
      proposedChange?: ProposedChange;
      requiresApproval: boolean;
    }
  | {
      status: 'rejected';
      reason: string;
    };

export interface NarrativeDropTarget {
  targetType: NarrativeObjectType | 'panel' | 'workspace' | 'timeline_phase';
  targetId: string;
  accepts: NarrativeObjectType[];
  onDrop: (
    payload: NarrativeDragPayload,
    context: NarrativeDropContext
  ) => NarrativeDropResult;
}
