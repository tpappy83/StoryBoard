import { useState, useCallback, DragEvent } from 'react';
import { useWorkspaceStore, DragPayload } from '../stores/workspaceStore';
import { NarrativeObjectType } from '../types';

interface UseDropTargetProps {
  accepts: NarrativeObjectType[];
  onDrop: (payload: DragPayload) => void;
}

export const useDropTarget = ({ accepts, onDrop }: UseDropTargetProps) => {
  const [isOver, setIsOver] = useState(false);
  const draggedObject = useWorkspaceStore((state) => state.draggedObject);
  const setDraggedObject = useWorkspaceStore((state) => state.setDraggedObject);

  const canAccept = draggedObject && Array.isArray(accepts) ? accepts.includes(draggedObject.type) : false;

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (canAccept) {
        e.dataTransfer.dropEffect = 'copy';
        if (!isOver) setIsOver(true);
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    },
    [canAccept, isOver]
  );

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      if (draggedObject && canAccept) {
        onDrop(draggedObject);
        setDraggedObject(null);
      }
    },
    [canAccept, draggedObject, onDrop, setDraggedObject]
  );

  return {
    isOver,
    canAccept,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};
