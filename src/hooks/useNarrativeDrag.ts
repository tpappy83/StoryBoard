import { useCallback } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { NarrativeDragPayload, NarrativeObjectType } from '../interactions/narrativeDragTypes';

export function useNarrativeDrag() {
  const setDraggedObject = useWorkspaceStore((state) => state.setDraggedObject);

  const startNarrativeDrag = useCallback(
    (
      objectType: NarrativeObjectType,
      objectId: string,
      label: string,
      data?: any,
      sourcePanelId?: string
    ) => {
      const payload: NarrativeDragPayload = {
        objectType,
        objectId,
        label,
        sourcePanelId,
        data
      };
      setDraggedObject({
        type: objectType,
        id: objectId,
        data: {
          label,
          sourcePanelId,
          ...data
        }
      });
      return payload;
    },
    [setDraggedObject]
  );

  const endNarrativeDrag = useCallback(() => {
    setDraggedObject(null);
  }, [setDraggedObject]);

  return {
    startNarrativeDrag,
    endNarrativeDrag
  };
}
