import { useCallback } from 'react';
import { useWorkspaceStore, DragPayload } from '../stores/workspaceStore';

export const useDragObject = () => {
  const setDraggedObject = useWorkspaceStore((state) => state.setDraggedObject);
  const draggedObject = useWorkspaceStore((state) => state.draggedObject);

  const startDrag = useCallback(
    (payload: DragPayload) => {
      setDraggedObject(payload);
    },
    [setDraggedObject]
  );

  const endDrag = useCallback(() => {
    setDraggedObject(null);
  }, [setDraggedObject]);

  return {
    draggedObject,
    startDrag,
    endDrag,
    isDragging: !!draggedObject
  };
};
