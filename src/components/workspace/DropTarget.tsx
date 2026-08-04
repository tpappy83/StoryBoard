import React from 'react';
import { useDropTarget } from '../../hooks/useDropTarget';
import { DragPayload } from '../../stores/workspaceStore';
import { NarrativeObjectType } from '../../types';
import { PlusCircle } from 'lucide-react';

interface DropTargetProps {
  accepts: NarrativeObjectType[];
  onDrop: (payload: DragPayload) => void;
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export const DropTarget: React.FC<DropTargetProps> = ({
  accepts,
  onDrop,
  children,
  className = '',
  label
}) => {
  const { isOver, canAccept, handleDragOver, handleDragLeave, handleDrop } = useDropTarget({
    accepts,
    onDrop
  });

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative transition-all ${
        isOver && canAccept
          ? 'ring-2 ring-indigo-500 bg-indigo-500/10 rounded-xl shadow-inner'
          : ''
      } ${className}`}
    >
      {children}

      {/* Visual Overlay indicator when hovering valid drop item */}
      {isOver && canAccept && (
        <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-[2px] border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center z-30 pointer-events-none animate-pulse">
          <div className="bg-[#0B1020] text-indigo-300 font-mono text-xs px-3 py-1.5 rounded-lg border border-indigo-500/40 shadow-lg flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Drop to link {label || accepts.join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
