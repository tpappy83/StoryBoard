import React, { useState } from 'react';
import { useNarrativeDrop } from '../../hooks/useNarrativeDrop';
import {
  NarrativeDropContext,
  NarrativeDropResult,
  NarrativeObjectType
} from '../../interactions/narrativeDragTypes';
import { DropConfirmationDialog } from './DropConfirmationDialog';

interface NarrativeDropZoneProps {
  targetType: NarrativeObjectType | 'panel' | 'workspace' | 'timeline_phase';
  targetId: string;
  accepts: NarrativeObjectType[];
  context: NarrativeDropContext;
  label?: string;
  onCommitOperation?: (result: NarrativeDropResult, payloadData?: any) => void;
  children: React.ReactNode;
  className?: string;
}

export const NarrativeDropZone: React.FC<NarrativeDropZoneProps> = ({
  targetType,
  targetId,
  accepts,
  context,
  label,
  onCommitOperation,
  children,
  className = ''
}) => {
  const [activeResult, setActiveResult] = useState<NarrativeDropResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { isOver, canAccept, handleDragOver, handleDragLeave, handleDrop } = useNarrativeDrop({
    targetType,
    targetId,
    accepts,
    context,
    onDropResult: (result) => {
      if (result.status === 'accepted') {
        if (result.requiresApproval) {
          setActiveResult(result);
          setIsDialogOpen(true);
        } else if (onCommitOperation) {
          onCommitOperation(result, result.proposedChange?.payloadData);
        }
      } else {
        setActiveResult(result);
        setTimeout(() => setActiveResult(null), 3000);
      }
    }
  });

  const handleConfirm = (payloadData?: any) => {
    setIsDialogOpen(false);
    if (activeResult && onCommitOperation) {
      onCommitOperation(activeResult, payloadData);
    }
    setActiveResult(null);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setActiveResult(null);
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative transition-all duration-200 ${
          isOver && canAccept
            ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20 bg-indigo-950/20 rounded-xl'
            : isOver && !canAccept
            ? 'ring-1 ring-rose-500/50 bg-rose-950/10 rounded-xl'
            : ''
        } ${className}`}
      >
        {children}

        {/* Hover drop preview prompt */}
        {isOver && canAccept && (
          <div className="absolute inset-0 z-20 pointer-events-none rounded-xl border-2 border-dashed border-indigo-400 bg-indigo-950/40 backdrop-blur-[2px] flex items-center justify-center p-2 text-center animate-fadeIn">
            <span className="text-xs font-semibold text-indigo-200 bg-indigo-900/80 px-3 py-1.5 rounded-lg border border-indigo-400/40 shadow-xl font-mono">
              Drop {label ? label : `onto ${targetType}`} → Evaluate Relationship Context
            </span>
          </div>
        )}

        {/* Rejected alert toast */}
        {activeResult && activeResult.status === 'rejected' && (
          <div className="absolute top-2 right-2 z-30 pointer-events-none bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs px-3 py-1.5 rounded-lg shadow-xl font-mono animate-bounce">
            ✕ {activeResult.reason}
          </div>
        )}
      </div>

      <DropConfirmationDialog
        isOpen={isDialogOpen}
        dropResult={activeResult}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};
