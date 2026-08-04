import { NarrativeDragPayload, NarrativeDropContext, NarrativeDropResult } from '../narrativeDragTypes';

export function handleLocationDroppedOnScene(
  payload: NarrativeDragPayload,
  target: { targetType: string; targetId: string },
  context: NarrativeDropContext
): NarrativeDropResult {
  const locationName = payload.label || (payload.metadata?.name as string) || 'New Location';
  const scene = context.scenes.find((s) => s.id === target.targetId);

  if (!scene) {
    return {
      status: 'rejected',
      reason: 'Target scene could not be found.'
    };
  }

  const warnings: string[] = [];
  if (scene.location && scene.location !== locationName) {
    warnings.push(
      `Location Change: Scene location will be changed from "${scene.location}" to "${locationName}". Check physical movement travel times.`
    );
  }

  return {
    status: 'accepted',
    operationType: 'updateSceneLocation',
    message: `Set Location of Scene "${scene.title}" to "${locationName}".`,
    requiresApproval: true,
    proposedChange: {
      title: `Update Location: "${scene.title}" → ${locationName}`,
      description: `Re-anchor scene environment setting to ${locationName}.`,
      impactLevel: 'medium',
      warnings,
      payloadData: {
        sceneId: scene.id,
        location: locationName
      }
    }
  };
}
