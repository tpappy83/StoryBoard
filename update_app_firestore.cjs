const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace manual save data
const manualSaveData = `        const data = {
          project,
          characters,
          relationships,
          plotThreads,
          convergenceEvents,
          scenes,
          timelineEvents,
          canonFacts,
          violations,
          structureMilestones,
          setups: useSetupPayoffStore.getState().setups,
          payoffs: useSetupPayoffStore.getState().payoffs
        };`;
code = code.replace(/const data = \{\n\s*project,[\s\S]*?structureMilestones\n\s*\};/, manualSaveData);

// Replace manual load data
const manualLoadData = `          if (data.project) setProject(data.project);
          if (data.characters) setCharacters(data.characters);
          if (data.relationships) setRelationships(data.relationships);
          if (data.plotThreads) setPlotThreads(data.plotThreads);
          if (data.convergenceEvents) setConvergenceEvents(data.convergenceEvents);
          if (data.scenes) setScenes(data.scenes);
          if (data.timelineEvents) setTimelineEvents(data.timelineEvents);
          if (data.canonFacts) setCanonFacts(data.canonFacts);
          if (data.violations) setViolations(data.violations);
          if (data.structureMilestones) setStructureMilestones(data.structureMilestones);
          if (data.setups) useSetupPayoffStore.setState({ setups: data.setups });
          if (data.payoffs) useSetupPayoffStore.setState({ payoffs: data.payoffs });`;
code = code.replace(/if \(data\.project\) setProject\(data\.project\);[\s\S]*?if \(data\.milestones\) setMilestones\(data\.milestones\);/, manualLoadData);

// Remove the old auto-load and auto-save
const autoLoadSaveRegex = /useEffect\(\(\) => \{\n\s*if \(user\) \{\n\s*const loadData = async \(\) => \{[\s\S]*?\}, \[user\]\);\n\n\s*useEffect\(\(\) => \{\n\s*if \(user\) \{\n\s*const saveData = async \(\) => \{[\s\S]*?\}\n\s*\}\n\s*\};\n\s*saveData\(\);\n\s*\}\n\s*\}, \[.*?\]\);/g;

code = code.replace(autoLoadSaveRegex, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Updated manual save/load and removed auto save/load");
