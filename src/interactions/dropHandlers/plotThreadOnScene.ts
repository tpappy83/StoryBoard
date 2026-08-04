import { NarrativeDragPayload, NarrativeDropContext, NarrativeDropResult } from '../narrativeDragTypes';

export function handlePlotThreadDroppedOnScene(
  payload: NarrativeDragPayload,
  target: { targetType: string; targetId: string },
  context: NarrativeDropContext
): NarrativeDropResult {
  const thread = context.plotThreads.find((t) => t.id === payload.objectId);
  const scene = context.scenes.find((s) => s.id === target.targetId);

  if (!thread || !scene) {
    return {
      status: 'rejected',
      reason: 'Plot thread or target scene could not be found.'
    };
  }

  return {
    status: 'accepted',
    operationType: 'attachThreadToScene',
    message: `Attach Plot Thread "${thread.name}" beat to Scene "${scene.title}".`,
    requiresApproval: true,
    proposedChange: {
      title: `Attach Plot Thread: ${thread.name}`,
      description: `Integrate plot beat [Category: ${thread.threadCategory || 'Main'}, Status: ${thread.status}] into Scene "${scene.title}".`,
      impactLevel: 'medium',
      relationshipTensions: [
        `Setup: ${thread.setup}`,
        `Escalation: ${thread.escalation}`
      ],
      payloadData: {
        threadId: thread.id,
        sceneId: scene.id,
        threadTitle: thread.name
      }
    }
  };
}
