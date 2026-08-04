import React, { useState } from 'react';
import { useDragObject } from '../hooks/useDragObject';
import { useWorkspaceStore } from '../stores/workspaceStore';
import {
  Folder,
  Users,
  GitCommit,
  MapPin,
  Layers,
  Clock,
  GitBranch,
  TrendingUp,
  Bookmark,
  ShieldCheck,
  Brain,
  History,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  GripVertical,
  PanelLeftClose,
  PanelLeftOpen,
  FolderKanban
} from 'lucide-react';
import {
  Character,
  Scene,
  PlotThread,
  CanonFact,
  TimelineEvent,
  Relationship,
  NarrativeObjectType
} from '../types';

interface NarrativeNavigatorProps {
  characters: Character[];
  scenes: Scene[];
  plotThreads: PlotThread[];
  canonFacts: CanonFact[];
  timelineEvents: TimelineEvent[];
  relationships?: Relationship[];
  selectedObjectId?: string;
  onSelectObject?: (type: NarrativeObjectType, id: string, data?: any) => void;
  onNewObject?: (type: NarrativeObjectType) => void;
}

export const NarrativeNavigator: React.FC<NarrativeNavigatorProps> = ({
  characters,
  scenes,
  plotThreads,
  canonFacts,
  timelineEvents,
  relationships,
  selectedObjectId,
  onSelectObject,
  onNewObject
}) => {
  const { startDrag } = useDragObject();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Projects: true,
    Characters: true,
    Scenes: true,
    'Plot Threads': true
  });
  
  const {
    isNavigatorCollapsed,
    toggleNavigatorCollapse,
    activeNavigatorSection,
    setActiveNavigatorSection,
    setActiveWorkspace
  } = useWorkspaceStore();

  const toggleCategory = (catName: string, workspace?: string) => {
    if (workspace) setActiveWorkspace(workspace);
    if (isNavigatorCollapsed) {
      toggleNavigatorCollapse();
      setActiveNavigatorSection(catName);
      setExpandedCategories(prev => ({ ...prev, [catName]: true }));
    } else {
      setExpandedCategories(prev => ({
        ...prev,
        [catName]: !prev[catName]
      }));
      setActiveNavigatorSection(catName);
    }
  };

  const categories = [
    { name: 'Projects', id: 'projects', icon: <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />, count: 1, type: 'project', workspace: 'CUSTOM' },
    { name: 'Characters', id: 'characters', icon: <Users className="w-4 h-4 text-blue-400 shrink-0" />, count: characters?.length || 0, type: 'character', workspace: 'CHARACTER' },
    { name: 'Relationships', id: 'relationships', icon: <GitCommit className="w-4 h-4 text-purple-400 shrink-0" />, count: relationships?.length || 4, type: 'relationship', workspace: 'CHARACTER' },
    { name: 'Locations', id: 'locations', icon: <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />, count: 6, type: 'location', workspace: 'WORLDBUILDING' },
    { name: 'Scenes', id: 'scenes', icon: <Layers className="w-4 h-4 text-amber-400 shrink-0" />, count: scenes?.length || 0, type: 'scene', workspace: 'WRITING_STUDIO' },
    { name: 'Plot Threads', id: 'plot_threads', icon: <GitBranch className="w-4 h-4 text-rose-400 shrink-0" />, count: plotThreads?.length || 0, type: 'plot_thread', workspace: 'PLANNING' },
    { name: 'Canon', id: 'canon', icon: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />, count: canonFacts?.length || 0, type: 'canon_fact', workspace: 'WORLDBUILDING' },
  ];

  const transitionClass = isNavigatorCollapsed ? 'duration-140 ease-in-out' : 'duration-180 ease-[cubic-bezier(0.2,0.8,0.2,1)]';

  return (
    <div className={`h-full flex flex-col bg-[#0B1020] border-r border-[#1E293B] text-slate-200 select-none font-mono overflow-hidden transition-all ${transitionClass}`}>
      {/* Header & Controls */}
      <div className={`flex items-center bg-[#0F172A] border-b border-[#1E293B] transition-all ${transitionClass} ${isNavigatorCollapsed ? 'p-2 justify-center' : 'p-3 justify-between'}`}>
        <div className={`flex flex-col overflow-hidden transition-opacity ${transitionClass} ${isNavigatorCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest whitespace-nowrap">Workspace</span>
          <span className="text-sm font-bold text-white whitespace-nowrap">Narrative Navigator</span>
        </div>
        <button
          onClick={toggleNavigatorCollapse}
          className={`text-slate-400 hover:text-white rounded-md hover:bg-[#1E293B] transition-colors shrink-0 ${isNavigatorCollapsed ? 'p-2' : 'p-1'}`}
          title={isNavigatorCollapsed ? "Expand Navigator" : "Collapse Navigator"}
        >
          {isNavigatorCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Bar */}
      <div className={`border-b border-[#1E293B] bg-[#0B1020] transition-all overflow-hidden ${transitionClass} ${isNavigatorCollapsed ? 'h-0 opacity-0 p-0 border-transparent' : 'p-2 opacity-100 h-[45px]'}`}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search story entities..."
            className="w-full bg-[#141B2D] border border-[#1E293B] text-slate-200 pl-8 pr-2 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 text-xs"
            tabIndex={isNavigatorCollapsed ? -1 : 0}
          />
        </div>
      </div>

      {/* Navigation Tree & Items */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden space-y-2 transition-all ${transitionClass} ${isNavigatorCollapsed ? 'p-1 space-y-3 mt-2 items-center' : 'p-2'}`}>
        {categories.map(cat => {
          const isExpanded = !!expandedCategories[cat.name] && !isNavigatorCollapsed;
          const isActive = activeNavigatorSection === cat.name;
          
          return (
            <div key={cat.name} className={`space-y-1 ${isNavigatorCollapsed ? 'w-full flex justify-center' : ''}`}>
              <div
                onClick={() => toggleCategory(cat.name, cat.workspace)}
                className={`flex items-center rounded-lg cursor-pointer transition-colors group relative ${
                  isNavigatorCollapsed 
                    ? `justify-center p-2 hover:bg-[#141B2D] ${isActive ? 'bg-[#1E293B]' : ''}`
                    : `justify-between px-2.5 py-1.5 hover:bg-[#1E293B]/60 ${isActive ? 'bg-[#1E293B] text-indigo-300 font-bold' : 'text-slate-300'}`
                }`}
                title={cat.name}
              >
                <div className="flex items-center shrink-0">
                  {!isNavigatorCollapsed && (
                    <div className="mr-2">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  )}
                  {cat.icon}
                  
                  <span className={`text-xs font-bold whitespace-nowrap overflow-hidden transition-all ${transitionClass} ${
                    isNavigatorCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-2'
                  }`}>
                    {cat.name}
                  </span>
                </div>
                
                <div className={`flex items-center overflow-hidden transition-all ${transitionClass} ${
                  isNavigatorCollapsed ? 'w-0 opacity-0 absolute -top-1 -right-1' : 'w-auto opacity-100 space-x-1'
                }`}>
                  {isNavigatorCollapsed ? (
                    cat.count > 0 && (
                      <span className="bg-indigo-600 text-[9px] text-white px-1 rounded-full font-bold">
                        {cat.count}
                      </span>
                    )
                  ) : (
                    <>
                      <span className="text-[10px] bg-[#0B1020] text-slate-400 px-1.5 py-0.5 rounded border border-[#1E293B]">
                        {cat.count}
                      </span>
                      {onNewObject && cat.type && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onNewObject(cat.type as NarrativeObjectType);
                          }}
                          className="p-1 hover:text-indigo-400 hover:bg-[#141B2D] rounded"
                          title={`New ${cat.name}`}
                          tabIndex={isNavigatorCollapsed ? -1 : 0}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Sub items when expanded */}
              <div className={`overflow-hidden transition-all ${transitionClass} ${
                isExpanded ? 'max-h-[1000px] opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
              }`}>
                {!isNavigatorCollapsed && (
                  <div className="pl-6 space-y-0.5 border-l border-[#1E293B] ml-3 mb-2">
                    {cat.name === 'Characters' &&
                      characters
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(char => (
                          <div
                            key={char.id}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData("text/plain", "character"); startDrag({ type: "character", id: char.id, data: char }); }}
                            onClick={() => onSelectObject && onSelectObject('character', char.id, char)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[#1E293B]/80 text-slate-300 transition-colors ${
                              selectedObjectId === char.id ? 'bg-indigo-900/40 text-indigo-200 border border-indigo-500/40 font-bold' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <GripVertical className="w-3 h-3 text-slate-600 shrink-0" />
                              <span className="truncate text-[11px]">{char.name}</span>
                            </div>
                            <span className="text-[9px] text-indigo-400 bg-indigo-950 px-1 rounded border border-indigo-800 shrink-0 ml-2">
                              {char.role}
                            </span>
                          </div>
                        ))}

                    {cat.name === 'Scenes' &&
                      scenes
                        .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(scene => (
                          <div
                            key={scene.id}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData("text/plain", "scene"); startDrag({ type: "scene", id: scene.id, data: scene }); }}
                            onClick={() => onSelectObject && onSelectObject('scene', scene.id, scene)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[#1E293B]/80 text-slate-300 transition-colors ${
                              selectedObjectId === scene.id ? 'bg-indigo-900/40 text-indigo-200 border border-indigo-500/40 font-bold' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <GripVertical className="w-3 h-3 text-slate-600 shrink-0" />
                              <span className="truncate text-[11px]">Ch.{scene.chapter} - {scene.title}</span>
                            </div>
                            <span className="text-[9px] text-amber-400 bg-amber-950 px-1 rounded border border-amber-800 shrink-0 ml-2">
                              {scene.status}
                            </span>
                          </div>
                        ))}

                    {cat.name === 'Plot Threads' &&
                      plotThreads
                        .filter(pt => pt.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(pt => (
                          <div
                            key={pt.id}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData("text/plain", "plot_thread"); startDrag({ type: "plot_thread", id: pt.id, data: pt }); }}
                            onClick={() => onSelectObject && onSelectObject('plot_thread', pt.id, pt)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[#1E293B]/80 text-slate-300 transition-colors ${
                              selectedObjectId === pt.id ? 'bg-indigo-900/40 text-indigo-200 border border-indigo-500/40 font-bold' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <GripVertical className="w-3 h-3 text-slate-600 shrink-0" />
                              <span className="truncate text-[11px]">{pt.name}</span>
                            </div>
                            <span className="text-[9px] text-rose-400 bg-rose-950 px-1 rounded border border-rose-800 shrink-0 ml-2">
                              {pt.status}
                            </span>
                          </div>
                        ))}

                    {cat.name === 'Canon' &&
                      canonFacts
                        .filter(cf => cf.fact.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(cf => (
                          <div
                            key={cf.id}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData("text/plain", "canon_fact"); startDrag({ type: "canon_fact", id: cf.id, data: cf }); }}
                            onClick={() => onSelectObject && onSelectObject('canon_fact', cf.id, cf)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[#1E293B]/80 text-slate-300 transition-colors ${
                              selectedObjectId === cf.id ? 'bg-indigo-900/40 text-indigo-200 border border-indigo-500/40 font-bold' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <GripVertical className="w-3 h-3 text-slate-600 shrink-0" />
                              <span className="truncate text-[11px]">{cf.fact}</span>
                            </div>
                            <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1 rounded border border-emerald-800 shrink-0 ml-2">
                              {cf.category}
                            </span>
                          </div>
                        ))}
                    {cat.name === 'Projects' && 
                      <div className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-[#1E293B]/80 text-slate-300">
                        <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[11px] font-bold">Current Project</span>
                      </div>
                    }
                    {cat.name === 'Locations' && 
                      <div className="text-xs text-slate-500 italic px-2 py-1">Locations module coming soon</div>
                    }
                    {cat.name === 'Relationships' && 
                      <div className="text-xs text-slate-500 italic px-2 py-1">Relationships map coming soon</div>
                    }
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
