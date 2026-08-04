import { NarrativeDragPayload, NarrativeDropContext, NarrativeDropResult } from '../narrativeDragTypes';

export function handleCharacterDroppedOnScene(
  payload: NarrativeDragPayload,
  target: { targetType: string; targetId: string },
  context: NarrativeDropContext
): NarrativeDropResult {
  const character = context.characters.find((c) => c.id === payload.objectId);
  const scene = context.scenes.find((s) => s.id === target.targetId);

  if (!character || !scene) {
    return {
      status: 'rejected',
      reason: 'Character or target scene could not be found in active story context.'
    };
  }

  const participantIds = scene.participantIds || [];

  if (participantIds.includes(character.id)) {
    return {
      status: 'rejected',
      reason: `${character.name} is already a participating character in Scene "${scene.title}".`
    };
  }

  // Analyze existing relationship dynamics between dropped character and existing scene participants
  const existingParticipants = context.characters.filter((c) =>
    participantIds.includes(c.id)
  );

  const relationshipTensions: string[] = [];
  existingParticipants.forEach((p) => {
    const rel = context.relationships.find(
      (r) =>
        (r.sourceCharId === character.id && r.targetCharId === p.id) ||
        (r.sourceCharId === p.id && r.targetCharId === character.id)
    );
    if (rel) {
      relationshipTensions.push(
        `${character.name} ↔ ${p.name}: ${rel.type} (Intensity ${rel.intensity}/10 - "${rel.history || 'Established Bond'}")`
      );
    } else {
      relationshipTensions.push(
        `${character.name} ↔ ${p.name}: Unestablished relationship. First contact beat.`
      );
    }
  });

  const warnings: string[] = [];
  if (character.status === 'Deceased' || character.status === 'Captured') {
    warnings.push(
      `Warning: ${character.name} has status "${character.status}". Ensure timeline continuity if featured.`
    );
  }

  return {
    status: 'accepted',
    operationType: 'linkCharacterToScene',
    message: `Add ${character.name} to Scene "${scene.title}" with relationship analysis.`,
    requiresApproval: true,
    proposedChange: {
      title: `Add ${character.name} to "${scene.title}"`,
      description: `Include ${character.name} (${character.role}) as an active participant in Chapter ${scene.chapter}, Pad ${scene.padIndex}.`,
      impactLevel: relationshipTensions.some((t) => t.includes('Intensity 7') || t.includes('Intensity 8') || t.includes('Intensity 9') || t.includes('Intensity 10'))
        ? 'high'
        : 'medium',
      relationshipTensions,
      warnings,
      payloadData: {
        characterId: character.id,
        sceneId: scene.id
      }
    }
  };
}
