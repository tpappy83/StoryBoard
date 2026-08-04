import { NarrativeDragPayload, NarrativeDropContext, NarrativeDropResult } from '../narrativeDragTypes';

export function handleCanonFactDroppedOnScene(
  payload: NarrativeDragPayload,
  target: { targetType: string; targetId: string },
  context: NarrativeDropContext
): NarrativeDropResult {
  const fact = context.canonFacts.find((f) => f.id === payload.objectId);
  const scene = context.scenes.find((s) => s.id === target.targetId);

  if (!fact || !scene) {
    return {
      status: 'rejected',
      reason: 'Canon lore fact or target scene could not be resolved.'
    };
  }

  const proseContainsFact = scene.prose.toLowerCase().includes(fact.fact.toLowerCase().slice(0, 20));

  const warnings: string[] = [];
  if (fact.confidence >= 90 && !proseContainsFact) {
    warnings.push(
      `High-Confidence Canon Alert (${fact.confidence}%): Scene prose must honor "${fact.fact}". Linking will insert a lore constraint anchor.`
    );
  }

  return {
    status: 'accepted',
    operationType: 'linkCanonToScene',
    message: `Bind Canon Lore Rule "${fact.fact.slice(0, 45)}..." onto Scene "${scene.title}".`,
    requiresApproval: true,
    proposedChange: {
      title: `Link Canon Fact to "${scene.title}"`,
      description: `Attach lore rule [Category: ${fact.category}, Confidence: ${fact.confidence}%] as a continuity constraint on scene.`,
      impactLevel: fact.confidence >= 90 ? 'high' : 'medium',
      warnings,
      payloadData: {
        factId: fact.id,
        sceneId: scene.id,
        factText: fact.fact
      }
    }
  };
}
