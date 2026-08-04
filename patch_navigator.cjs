const fs = require('fs');
const path = './src/components/NarrativeNavigator.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the return statement to correctly implement the collapsed/expanded logic
// and route clicks to workstations.

content = content.replace(
  /const categories = \[\s*\{ name: 'Projects'[\s\S]*?\];/,
  `const categories = [
    { name: 'Projects', id: 'projects', icon: <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />, count: 1, type: 'project', workspace: 'CUSTOM' },
    { name: 'Characters', id: 'characters', icon: <Users className="w-4 h-4 text-blue-400 shrink-0" />, count: characters.length, type: 'character', workspace: 'CHARACTER' },
    { name: 'Relationships', id: 'relationships', icon: <GitCommit className="w-4 h-4 text-purple-400 shrink-0" />, count: relationships?.nodes.length || 4, type: 'relationship', workspace: 'CHARACTER' },
    { name: 'Locations', id: 'locations', icon: <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />, count: 6, type: 'location', workspace: 'WORLDBUILDING' },
    { name: 'Scenes', id: 'scenes', icon: <Layers className="w-4 h-4 text-amber-400 shrink-0" />, count: scenes.length, type: 'scene', workspace: 'WRITING_STUDIO' },
    { name: 'Plot Threads', id: 'plot_threads', icon: <GitBranch className="w-4 h-4 text-rose-400 shrink-0" />, count: plotThreads.length, type: 'plot_thread', workspace: 'PLANNING' },
    { name: 'Canon', id: 'canon', icon: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />, count: canonFacts.length, type: 'canon_fact', workspace: 'WORLDBUILDING' },
  ];`
);

content = content.replace(
  /const {[\s\S]*?} = useWorkspaceStore\(\);/,
  `const {
    isNavigatorCollapsed,
    toggleNavigatorCollapse,
    activeNavigatorSection,
    setActiveNavigatorSection,
    setActiveWorkspace
  } = useWorkspaceStore();`
);

content = content.replace(
  /const toggleCategory = \(catName: string\) => \{[\s\S]*?\}\s*\};/,
  `const toggleCategory = (catName: string, workspace?: string) => {
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
  };`
);

content = content.replace(
  /onClick=\{\(\) => toggleCategory\(cat\.name\)\}/g,
  `onClick={() => toggleCategory(cat.name, cat.workspace)}`
);

fs.writeFileSync(path, content);
