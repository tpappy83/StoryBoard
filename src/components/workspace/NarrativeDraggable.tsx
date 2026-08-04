import React from 'react';
import { useNarrativeDrag } from '../../hooks/useNarrativeDrag';
import { NarrativeObjectType } from '../../interactions/narrativeDragTypes';

interface NarrativeDraggableProps {
  objectType: NarrativeObjectType;
  objectId: string;
  label: string;
  data?: any;
  sourcePanelId?: string;
  children: React.ReactNode;
  className?: string;
}

export const NarrativeDraggable: React.FC<NarrativeDraggableProps> = ({
  objectType,
  objectId,
  label,
  data,
  sourcePanelId,
  children,
  className = ''
}) => {
  const { startNarrativeDrag, endNarrativeDrag } = useNarrativeDrag();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ type: objectType, id: objectId, label, data })
    );
    e.dataTransfer.effectAllowed = 'copyMove';
    startNarrativeDrag(objectType, objectId, label, data, sourcePanelId);
  };

  const handleDragEnd = () => {
    endNarrativeDrag();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`cursor-grab active:cursor-grabbing transition-transform active:scale-[0.98] ${className}`}
    >
      {children}
    </div>
  );
};
