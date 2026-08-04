import { NarrativeDragPayload, NarrativeDropContext, NarrativeDropResult } from '../narrativeDragTypes';

export function handleCharacterDroppedOnCharacter(
  payload: NarrativeDragPayload,
  target: { targetType: string; targetId: string },
  context: NarrativeDropContext
): NarrativeDropResult {
  const char1 = context.characters.find((c) => c.id === payload.objectId);
  const char2 = context.characters.find((c) => c.id === target.targetId);

  if (!char1 || !char2) {
    return {
      status: 'rejected',
      reason: 'Source or target character could not be found.'
    };
  }

  if (char1.id === char2.id) {
    return {
      status: 'rejected',
      reason: 'Cannot establish a relationship with the same character.'
    };
  }

  const existingRel = context.relationships.find(
    (r) =>
      (r.sourceCharId === char1.id && r.targetCharId === char2.id) ||
      (r.sourceCharId === char2.id && r.targetCharId === char1.id)
  );

  if (existingRel) {
    return {
      status: 'accepted',
      operationType: 'createRelationship',
      message: `Inspect or modify existing relationship between ${char1.name} and ${char2.name}.`,
      requiresApproval: false,
      proposedChange: {
        title: `Modify Relationship: ${char1.name} & ${char2.name}`,
        description: `Existing dynamic: ${existingRel.type} (Intensity: ${existingRel.intensity}/10). ${existingRel.history}`,
        impactLevel: 'medium',
        relationshipTensions: [
          `Current Bond: ${existingRel.type}`,
          `Trust Score: ${existingRel.trustScore}/100`,
          `History: ${existingRel.history}`
        ],
        payloadData: {
          existingRelId: existingRel.id,
          sourceCharId: char1.id,
          targetCharId: char2.id
        }
      }
    };
  }

  return {
    status: 'accepted',
    operationType: 'createRelationship',
    message: `Forge new interpersonal relationship bond between ${char1.name} and ${char2.name}.`,
    requiresApproval: true,
    proposedChange: {
      title: `Create Relationship: ${char1.name} ↔ ${char2.name}`,
      description: `Establish an initial interpersonal relationship link with dynamic tension modeling.`,
      impactLevel: 'medium',
      relationshipTensions: [
        `${char1.name} (${char1.role}) ↔ ${char2.name} (${char2.role})`
      ],
      payloadData: {
        sourceCharId: char1.id,
        targetCharId: char2.id,
        defaultType: 'Alliance'
      }
    }
  };
}
