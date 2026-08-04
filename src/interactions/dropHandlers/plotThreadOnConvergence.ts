import { NarrativeDragPayload, NarrativeDropContext, NarrativeDropResult } from '../narrativeDragTypes';

export function handlePlotThreadDroppedOnConvergence(
  payload: NarrativeDragPayload,
  target: { targetType: string; targetId: string },
  context: NarrativeDropContext
): NarrativeDropResult {
  const thread = context.plotThreads.find((t) => t.id === payload.objectId);
  const convergence = context.convergenceEvents.find((c) => c.id === target.targetId);

  if (!thread || !convergence) {
    return {
      status: 'rejected',
      reason: 'Plot thread or convergence node could not be resolved.'
    };
  }

  if ((convergence.connectingThreadIds || []).includes(thread.id)) {
    return {
      status: 'rejected',
      reason: `Plot thread "${thread.name}" is already contributing to Convergence Node "${convergence.name}".`
    };
  }

  return {
    status: 'accepted',
    operationType: 'createConvergenceLink',
    message: `Connect Plot Thread "${thread.name}" into Climax Convergence Node "${convergence.name}".`,
    requiresApproval: true,
    proposedChange: {
      title: `Convergence Link: ${thread.name} → ${convergence.name}`,
      description: `Feed plot line into climatic convergence event "${convergence.name}" (Outcome: ${convergence.targetOutcome}).`,
      impactLevel: 'high',
      payloadData: {
        threadId: thread.id,
        convergenceId: convergence.id
      }
    }
  };
}
