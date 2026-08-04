import { useState, useCallback, DragEvent } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import {
  NarrativeDragPayload,
  NarrativeDropContext,
  NarrativeDropResult,
  NarrativeObjectType
} from '../interactions/narrativeDragTypes';
import { executeNarrativeDrop } from '../interactions/executeNarrativeDrop';

interface UseNarrativeDropOptions {
  targetType: NarrativeObjectType | 'panel' | 'workspace' | 'timeline_phase';
  targetId: string;
  accepts: NarrativeObjectType[];
  context: NarrativeDropContext;
  onDropResult?: (result: NarrativeDropResult) => void;
}

export function useNarrativeDrop({
  targetType,
  targetId,
  accepts,
  context,
  onDropResult
}: UseNarrativeDropOptions) {
  const [isOver, setIsOver] = useState(false);
  const draggedObject = useWorkspaceStore((state) => state.draggedObject);

  const canAccept = draggedObject && Array.isArray(accepts) ? accepts.includes(draggedObject.type) : false;

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (canAccept) {
        e.dataTransfer.dropEffect = 'copy';
        setIsOver(true);
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    },
    [canAccept]
  );

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsOver(false);

      if (!draggedObject || !canAccept) return;

      const payload: NarrativeDragPayload = {
        objectType: draggedObject.type,
        objectId: draggedObject.id,
        label: draggedObject.data?.label || draggedObject.id,
        sourcePanelId: draggedObject.data?.sourcePanelId,
        data: draggedObject.data
      };

      const result = executeNarrativeDrop(payload, { targetType, targetId }, context);

      if (onDropResult) {
        onDropResult(result);
      }
    },
    [draggedObject, canAccept, targetType, targetId, context, onDropResult]
  );

  return {
    isOver,
    canAccept,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
