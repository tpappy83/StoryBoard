import React from 'react';
import { useDocking } from '../../hooks/useDocking';
import { Maximize2, ExternalLink, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';

interface PanelContainerProps {
  panelId: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  panelId,
  title,
  children,
  icon,
  actions,
  className = ''
}) => {
  const { isFloating, isMinimized, toggleFloat, toggleMinimize } = useDocking(panelId);

  if (isFloating) {
    return (
      <div className="p-3 bg-[#0B1020] border border-dashed border-[#1E293B] rounded-xl text-center text-slate-500 font-mono text-xs">
        <span>Panel "{title}" is floating in a separate window.</span>
        <button
          onClick={() => toggleFloat()}
          className="ml-2 text-indigo-400 underline hover:text-indigo-300"
        >
          Dock Back
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-lg overflow-hidden flex flex-col font-mono transition-all ${className}`}
    >
      {/* Panel Header */}
      <div className="bg-[#141B2D] px-3 py-2 border-b border-[#1E293B] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-bold text-slate-200 tracking-wide uppercase">{title}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          {actions}
          <button
            onClick={() => toggleMinimize()}
            className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-[#1E293B]"
            title={isMinimized ? 'Expand' : 'Collapse'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => toggleFloat()}
            className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-[#1E293B]"
            title="Pop out to floating window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      {!isMinimized && <div className="flex-1 overflow-y-auto">{children}</div>}
    </div>
  );
};
