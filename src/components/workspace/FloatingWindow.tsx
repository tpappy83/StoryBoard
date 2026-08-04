import React, { useState, useRef } from 'react';
import { useDocking } from '../../hooks/useDocking';
import { Minimize2, Maximize2, Pin, Move, X } from 'lucide-react';

interface FloatingWindowProps {
  panelId: string;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  panelId,
  title,
  children,
  onClose
}) => {
  const { panel, updatePos, togglePin, toggleMaximize, toggleFloat, isPinned, isMaximized } =
    useDocking(panelId);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!panel || !panel.isFloating) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - (panel.x || 100),
      y: e.clientY - (panel.y || 100)
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    updatePos(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'fixed',
        left: isMaximized ? 0 : `${panel.x || 100}px`,
        top: isMaximized ? 0 : `${panel.y || 100}px`,
        width: isMaximized ? '100vw' : `${panel.width || 540}px`,
        height: isMaximized ? '100vh' : `${panel.height || 420}px`,
        zIndex: isMaximized ? 60 : 45
      }}
      className="bg-[#0F172A]/95 backdrop-blur-md border border-[#1E293B] rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono transition-all"
    >
      {/* Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-[#1E293B]/80 px-3 py-2 flex items-center justify-between border-b border-[#334155] cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center space-x-2">
          <Move className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={togglePin}
            className={`p-1 rounded hover:bg-[#334155] ${
              isPinned ? 'text-indigo-400' : 'text-slate-500'
            }`}
            title={isPinned ? 'Pinned' : 'Unpinned'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMaximize}
            className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-[#334155]"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              toggleFloat();
              if (onClose) onClose();
            }}
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-[#334155]"
            title="Dock Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-3 text-slate-300 text-xs">{children}</div>
    </div>
  );
};
