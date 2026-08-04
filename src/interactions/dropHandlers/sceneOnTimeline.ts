import { NarrativeDragPayload, NarrativeDropContext, NarrativeDropResult } from '../narrativeDragTypes';

export function handleSceneDroppedOnTimeline(
  payload: NarrativeDragPayload,
  target: { targetType: string; targetId: string },
  context: NarrativeDropContext
): NarrativeDropResult {
  const scene = context.scenes.find((s) => s.id === payload.objectId);

  if (!scene) {
    return {
      status: 'rejected',
      reason: 'Scene object could not be found in active manuscript.'
    };
  }

  const phaseNum = parseInt(target.targetId, 10) || 1;

  const warnings: string[] = [];
  const sceneChars = context.characters.filter((c) => (scene.participantIds || []).includes(c.id));
  if (sceneChars.length === 0) {
    warnings.push('Scene has no assigned character participants yet.');
  }

  return {
    status: 'accepted',
    operationType: 'moveSceneToTimeline',
    message: `Anchor Scene "${scene.title}" onto Timeline Phase ${phaseNum}.`,
    requiresApproval: true,
    proposedChange: {
      title: `Map Scene "${scene.title}" to Timeline Phase ${phaseNum}`,
      description: `Create an explicit timeline event marker anchored at Phase ${phaseNum} representing Chapter ${scene.chapter}, Scene Pad ${scene.padIndex}.`,
      impactLevel: 'medium',
      warnings,
      payloadData: {
        sceneId: scene.id,
        phase: phaseNum,
        involvedCharIds: scene.participantIds
      }
    }
  };
}
