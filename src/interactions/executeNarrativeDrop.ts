import {
  NarrativeDragPayload,
  NarrativeDropContext,
  NarrativeDropResult
} from './narrativeDragTypes';
import { handleCharacterDroppedOnScene } from './dropHandlers/characterOnScene';
import { handleCharacterDroppedOnCharacter } from './dropHandlers/characterOnCharacter';
import { handleCanonFactDroppedOnScene } from './dropHandlers/canonFactOnScene';
import { handleSceneDroppedOnTimeline } from './dropHandlers/sceneOnTimeline';
import { handlePlotThreadDroppedOnScene } from './dropHandlers/plotThreadOnScene';
import { handlePlotThreadDroppedOnConvergence } from './dropHandlers/plotThreadOnConvergence';
import { handleLocationDroppedOnScene } from './dropHandlers/locationOnScene';

export function executeNarrativeDrop(
  payload: NarrativeDragPayload,
  target: {
    targetType: string;
    targetId: string;
  },
  context: NarrativeDropContext
): NarrativeDropResult {
  if (!payload || !target) {
    return {
      status: 'rejected',
      reason: 'Invalid drag payload or drop target parameters.'
    };
  }

  // Character -> Scene
  if (payload.objectType === 'character' && target.targetType === 'scene') {
    return handleCharacterDroppedOnScene(payload, target, context);
  }

  // Character -> Character
  if (payload.objectType === 'character' && target.targetType === 'character') {
    return handleCharacterDroppedOnCharacter(payload, target, context);
  }

  // Canon Fact -> Scene
  if (payload.objectType === 'canon_fact' && target.targetType === 'scene') {
    return handleCanonFactDroppedOnScene(payload, target, context);
  }

  // Scene -> Timeline / Phase
  if (payload.objectType === 'scene' && (target.targetType === 'timeline' || target.targetType === 'timeline_phase')) {
    return handleSceneDroppedOnTimeline(payload, target, context);
  }

  // Plot Thread -> Scene
  if (payload.objectType === 'plot_thread' && target.targetType === 'scene') {
    return handlePlotThreadDroppedOnScene(payload, target, context);
  }

  // Plot Thread -> Convergence Event
  if (payload.objectType === 'plot_thread' && target.targetType === 'convergence_event') {
    return handlePlotThreadDroppedOnConvergence(payload, target, context);
  }

  // Location -> Scene
  if (payload.objectType === 'location' && target.targetType === 'scene') {
    return handleLocationDroppedOnScene(payload, target, context);
  }

  // Character -> Timeline
  if (payload.objectType === 'character' && (target.targetType === 'timeline' || target.targetType === 'timeline_phase')) {
    const char = context.characters.find((c) => c.id === payload.objectId);
    const phaseNum = parseInt(target.targetId, 10) || 1;
    return {
      status: 'accepted',
      operationType: 'moveSceneToTimeline',
      message: `Anchor ${char?.name || 'Character'} onto Timeline Phase ${phaseNum}.`,
      requiresApproval: true,
      proposedChange: {
        title: `Anchor ${char?.name} to Timeline Phase ${phaseNum}`,
        description: `Link character state milestone to Phase ${phaseNum}.`,
        impactLevel: 'medium',
        payloadData: {
          characterId: payload.objectId,
          phase: phaseNum
        }
      }
    };
  }

  return {
    status: 'rejected',
    reason: `Cannot drop ${payload.objectType.replace('_', ' ')} onto ${target.targetType.replace('_', ' ')}.`
  };
}
