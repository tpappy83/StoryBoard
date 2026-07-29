import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Users,
  Film,
  GitBranch,
  BookOpen,
  AlertTriangle,
  Plus,
  Search,
  Sparkles,
  GitMerge,
  ChevronLeft,
  FileText,
  Edit3,
  Check,
  X,
  MapPin
} from 'lucide-react';
import {
  Character,
  Scene,
  PlotThread,
  CanonFact,
  ContinuityViolation,
  ConvergenceEvent,
  Relationship
} from '../types';

interface BrowserPanelProps {
  characters: Character[];
  scenes: Scene[];
  plotThreads: PlotThread[];
  canonFacts: CanonFact[];
  violations: ContinuityViolation[];
  relationships: Relationship[];
  convergenceEvents: ConvergenceEvent[];
  selectedCharId: string | null;
  setSelectedCharId: (id: string | null) => void;
  selectedSceneId: string | null;
  setSelectedSceneId: (id: string | null) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  onQuickAddCharacter: () => void;
  onQuickAddScene: () => void;
  onQuickAddPlotThread: () => void;
  onQuickAddFact: () => void;
  onUpdateCharacter?: (updated: Character) => void;
  onUpdateScene?: (updated: Scene) => void;
  onUpdateLocation?: (oldLocation: string, newLocation: string) => void;
}

export const BrowserPanel: React.FC<BrowserPanelProps> = ({
  characters,
  scenes,
  plotThreads,
  canonFacts,
  violations,
  relationships,
  convergenceEvents,
  selectedCharId,
  setSelectedCharId,
  selectedSceneId,
  setSelectedSceneId,
  isCollapsed,
  setIsCollapsed,
  onQuickAddCharacter,
  onQuickAddScene,
  onQuickAddPlotThread,
  onQuickAddFact,
  onUpdateCharacter,
  onUpdateScene,
  onUpdateLocation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [editingCharName, setEditingCharName] = useState('');
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingSceneTitle, setEditingSceneTitle] = useState('');
  const [editingSceneLocation, setEditingSceneLocation] = useState('');
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editingLocationName, setEditingLocationName] = useState('');

  const [openSections, setOpenSections] = useState({
    characters: true,
    scenes: true,
    locations: true,
    threads: true,
    convergence: false,
    canon: false,
    violations: true
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveCharName = (char: Character) => {
    if (editingCharName.trim() && onUpdateCharacter) {
      onUpdateCharacter({ ...char, name: editingCharName.trim() });
    }
    setEditingCharId(null);
  };

  const handleSaveSceneInfo = (scene: Scene) => {
    if ((editingSceneTitle.trim() || editingSceneLocation.trim()) && onUpdateScene) {
      onUpdateScene({
        ...scene,
        title: editingSceneTitle.trim() || scene.title,
        location: editingSceneLocation.trim() || scene.location
      });
    }
    setEditingSceneId(null);
  };

  const handleSaveLocation = (oldLoc: string) => {
    if (editingLocationName.trim() && editingLocationName.trim() !== oldLoc && onUpdateLocation) {
      onUpdateLocation(oldLoc, editingLocationName.trim());
    }
    setEditingLocation(null);
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-[#141B2D] border-r border-[#1A2338] flex flex-col items-center py-4 space-y-4 text-slate-400">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:text-white bg-[#0B1020] rounded border border-slate-700/60"
          title="Expand Project Browser"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="border-t border-slate-800 w-8" />
        <Users className="w-4 h-4 hover:text-indigo-400 cursor-pointer" onClick={() => setIsCollapsed(false)} title="Characters" />
        <Film className="w-4 h-4 hover:text-indigo-400 cursor-pointer" onClick={() => setIsCollapsed(false)} title="Scenes" />
        <MapPin className="w-4 h-4 hover:text-indigo-400 cursor-pointer" onClick={() => setIsCollapsed(false)} title="Locations" />
        <GitBranch className="w-4 h-4 hover:text-indigo-400 cursor-pointer" onClick={() => setIsCollapsed(false)} title="Plot Threads" />
        <BookOpen className="w-4 h-4 hover:text-indigo-400 cursor-pointer" onClick={() => setIsCollapsed(false)} title="Canon Memory" />
        <AlertTriangle className="w-4 h-4 hover:text-amber-400 cursor-pointer" onClick={() => setIsCollapsed(false)} title="Violations" />
      </aside>
    );
  }

  const filteredCharacters = characters.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredScenes = scenes.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.location.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Extract unique locations from scenes
  const uniqueLocations: string[] = Array.from(new Set(scenes.map(s => s.location).filter(Boolean)));
  const filteredLocations = uniqueLocations.filter((loc: string) => loc.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredThreads = plotThreads.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFacts = canonFacts.filter(f => f.fact.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <aside className="w-64 bg-[#141B2D] border-r border-[#1A2338] flex flex-col h-[calc(100vh-53px)] select-none">
      {/* Header */}
      <div className="p-3 border-b border-[#1A2338] flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 tracking-wider">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>PROJECT BROWSER</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1A2338]"
          title="Collapse Browser"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-2 border-b border-[#1A2338]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search canon..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B1020] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded border border-[#1A2338] focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
        {/* Characters Section */}
        <div className="border border-[#1A2338] rounded bg-[#0B1020]/50 overflow-hidden">
          <div
            onClick={() => toggleSection('characters')}
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#1A2338] text-slate-300 font-semibold"
          >
            <div className="flex items-center space-x-2">
              {openSections.characters ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>CHARACTERS</span>
              <span className="text-[10px] bg-indigo-950/80 text-indigo-300 px-1.5 rounded">{filteredCharacters.length}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onQuickAddCharacter(); }}
              className="p-0.5 hover:text-white text-slate-400 rounded"
              title="Add Character"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {openSections.characters && (
            <div className="p-1 space-y-1 bg-[#0B1020]">
              {filteredCharacters.map(char => {
                const isEditing = editingCharId === char.id;
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                      selectedCharId === char.id
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200'
                        : 'hover:bg-[#1A2338] text-slate-300'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center space-x-1.5 w-full" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingCharName}
                          onChange={e => setEditingCharName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveCharName(char);
                            if (e.key === 'Escape') setEditingCharId(null);
                          }}
                          autoFocus
                          className="bg-[#141B2D] text-white text-xs px-1.5 py-0.5 rounded border border-indigo-500 focus:outline-none flex-1"
                        />
                        <button
                          onClick={() => handleSaveCharName(char)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Save Name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCharId(null)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="truncate">{char.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[60px]">{char.role}</span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setEditingCharId(char.id);
                              setEditingCharName(char.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-300 transition-opacity"
                            title="Rename Character"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scenes Section */}
        <div className="border border-[#1A2338] rounded bg-[#0B1020]/50 overflow-hidden">
          <div
            onClick={() => toggleSection('scenes')}
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#1A2338] text-slate-300 font-semibold"
          >
            <div className="flex items-center space-x-2">
              {openSections.scenes ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              <span>SCENES & PADS</span>
              <span className="text-[10px] bg-indigo-950/80 text-indigo-300 px-1.5 rounded">{filteredScenes.length}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onQuickAddScene(); }}
              className="p-0.5 hover:text-white text-slate-400 rounded"
              title="Add Scene"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {openSections.scenes && (
            <div className="p-1 space-y-1 bg-[#0B1020]">
              {filteredScenes.map((sc) => {
                const isEditing = editingSceneId === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedSceneId(sc.id)}
                    className={`group p-1.5 rounded cursor-pointer transition-colors ${
                      selectedSceneId === sc.id
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200'
                        : 'hover:bg-[#1A2338] text-slate-300'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-1.5 bg-[#141B2D] p-2 rounded border border-indigo-500" onClick={e => e.stopPropagation()}>
                        <div className="text-[9px] font-mono text-indigo-300 uppercase">RENAME SCENE & LOCATION</div>
                        <input
                          type="text"
                          value={editingSceneTitle}
                          onChange={e => setEditingSceneTitle(e.target.value)}
                          placeholder="Scene title..."
                          autoFocus
                          className="w-full bg-[#0B1020] text-white text-xs px-2 py-1 rounded border border-[#1A2338] focus:outline-none focus:border-indigo-400"
                        />
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={editingSceneLocation}
                            onChange={e => setEditingSceneLocation(e.target.value)}
                            placeholder="Location name..."
                            className="w-full bg-[#0B1020] text-slate-200 text-[11px] px-2 py-0.5 rounded border border-[#1A2338] focus:outline-none focus:border-indigo-400 font-mono"
                          />
                        </div>
                        <div className="flex items-center justify-end space-x-1.5 pt-1">
                          <button
                            onClick={() => setEditingSceneId(null)}
                            className="px-2 py-0.5 bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px] rounded font-mono"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveSceneInfo(sc)}
                            className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] rounded font-bold font-mono"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                            <span className="font-mono text-[10px] text-slate-500">P{sc.padIndex}</span>
                            <span className="truncate text-xs font-medium">{sc.title}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`text-[9px] px-1 rounded font-bold ${
                              sc.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              sc.status === 'Violation' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                              sc.status === 'Convergence' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {sc.status}
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setEditingSceneId(sc.id);
                                setEditingSceneTitle(sc.title);
                                setEditingSceneLocation(sc.location);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-300 transition-opacity"
                              title="Edit Title & Location"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {sc.location && (
                          <div className="text-[10px] text-slate-400 font-mono pl-5 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-indigo-400" />
                            <span className="truncate">{sc.location}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Locations Section */}
        <div className="border border-[#1A2338] rounded bg-[#0B1020]/50 overflow-hidden">
          <div
            onClick={() => toggleSection('locations')}
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#1A2338] text-slate-300 font-semibold"
          >
            <div className="flex items-center space-x-2">
              {openSections.locations ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>LOCATIONS</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 rounded">{filteredLocations.length}</span>
            </div>
          </div>

          {openSections.locations && (
            <div className="p-1 space-y-1 bg-[#0B1020]">
              {filteredLocations.map((loc: string) => {
                const isEditing = editingLocation === loc;
                const sceneCount = scenes.filter(s => s.location === loc).length;
                return (
                  <div
                    key={loc}
                    className="group p-1.5 rounded transition-colors hover:bg-[#1A2338] text-slate-300"
                  >
                    {isEditing ? (
                      <div className="flex items-center space-x-1.5 w-full" onClick={e => e.stopPropagation()}>
                        <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={editingLocationName}
                          onChange={e => setEditingLocationName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveLocation(loc);
                            if (e.key === 'Escape') setEditingLocation(null);
                          }}
                          autoFocus
                          className="bg-[#141B2D] text-white text-xs px-1.5 py-0.5 rounded border border-emerald-500 focus:outline-none flex-1 font-mono"
                        />
                        <button
                          onClick={() => handleSaveLocation(loc)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Save Location"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingLocation(null)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                          <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span className="truncate text-xs font-mono">{loc}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] px-1 rounded font-mono bg-slate-800 text-slate-400" title={`${sceneCount} scene(s)`}>
                            {sceneCount} scene{sceneCount !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setEditingLocation(loc);
                              setEditingLocationName(loc);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-emerald-300 transition-opacity"
                            title="Rename Location Across All Scenes"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Plot Threads Section */}
        <div className="border border-[#1A2338] rounded bg-[#0B1020]/50 overflow-hidden">
          <div
            onClick={() => toggleSection('threads')}
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#1A2338] text-slate-300 font-semibold"
          >
            <div className="flex items-center space-x-2">
              {openSections.threads ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>PLOT THREADS</span>
              <span className="text-[10px] bg-purple-950/80 text-purple-300 px-1.5 rounded">{filteredThreads.length}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onQuickAddPlotThread(); }}
              className="p-0.5 hover:text-white text-slate-400 rounded"
              title="Add Plot Thread"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {openSections.threads && (
            <div className="p-1 space-y-1 bg-[#0B1020]">
              {filteredThreads.map(thread => (
                <div key={thread.id} className="p-1.5 rounded bg-[#141B2D] border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: thread.color }} />
                    <span className="text-slate-200 font-medium">{thread.name}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">{thread.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Convergence Events */}
        <div className="border border-[#1A2338] rounded bg-[#0B1020]/50 overflow-hidden">
          <div
            onClick={() => toggleSection('convergence')}
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#1A2338] text-slate-300 font-semibold"
          >
            <div className="flex items-center space-x-2">
              {openSections.convergence ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <GitMerge className="w-3.5 h-3.5 text-amber-400" />
              <span>CONVERGENCE</span>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 px-1.5 rounded">{convergenceEvents.length}</span>
            </div>
          </div>

          {openSections.convergence && (
            <div className="p-1 space-y-1 bg-[#0B1020]">
              {convergenceEvents.map(conv => (
                <div key={conv.id} className="p-1.5 rounded bg-[#141B2D] border border-amber-900/40 text-amber-200 font-medium">
                  <div>{conv.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">{conv.targetOutcome}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Canon Memory Facts */}
        <div className="border border-[#1A2338] rounded bg-[#0B1020]/50 overflow-hidden">
          <div
            onClick={() => toggleSection('canon')}
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#1A2338] text-slate-300 font-semibold"
          >
            <div className="flex items-center space-x-2">
              {openSections.canon ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>CANON FACTS</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 rounded">{filteredFacts.length}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onQuickAddFact(); }}
              className="p-0.5 hover:text-white text-slate-400 rounded"
              title="Add Canon Fact"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {openSections.canon && (
            <div className="p-1 space-y-1.5 bg-[#0B1020]">
              {filteredFacts.slice(0, 6).map(fact => (
                <div key={fact.id} className="p-1.5 rounded bg-[#141B2D] border border-slate-800 text-slate-300 text-[11px] leading-tight">
                  <div className="flex items-center justify-between text-[9px] text-emerald-400 font-mono mb-1">
                    <span>[{fact.category}]</span>
                    <span>#{fact.contentHash}</span>
                  </div>
                  <div>{fact.fact}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Violations Ledger */}
        <div className="border border-rose-900/40 rounded bg-rose-950/20 overflow-hidden">
          <div
            onClick={() => toggleSection('violations')}
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-rose-900/30 text-rose-300 font-semibold"
          >
            <div className="flex items-center space-x-2">
              {openSections.violations ? <ChevronDown className="w-3.5 h-3.5 text-rose-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>VIOLATIONS LEDGER</span>
              <span className="text-[10px] bg-rose-900 text-rose-200 px-1.5 rounded">{violations.filter(v => !v.resolved).length}</span>
            </div>
          </div>

          {openSections.violations && (
            <div className="p-1 space-y-1.5 bg-[#0B1020]">
              {violations.filter(v => !v.resolved).map(viol => (
                <div key={viol.id} className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-200 text-[11px]">
                  <div className="font-bold text-rose-400 mb-0.5">{viol.ruleName}</div>
                  <div className="text-[10px] text-slate-300 leading-tight mb-1">{viol.details}</div>
                  <div className="text-[9px] text-amber-300 font-medium">Fix: {viol.suggestedFix}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
