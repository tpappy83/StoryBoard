const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importFirebase = `import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useSettingsStore } from './stores/settingsStore';
`;

code = code.replace(/import { doc, setDoc, getDoc } from 'firebase\/firestore';\nimport { db } from '\.\/firebase';\nimport { auth } from '\.\/firebase';\nimport { onAuthStateChanged, User } from 'firebase\/auth';\n?/g, '');
code = code.replace("import { useSettingsStore } from './stores/settingsStore';", "");
code = importFirebase + code;

const saveLogic = `
  // Setup Firestore save/load
  useEffect(() => {
    const saveToFirestore = async () => {
      const { firebaseUser } = useAuthStore.getState();
      if (!firebaseUser) {
        alert("Please sign in to save to cloud.");
        return;
      }
      
      try {
        useSettingsStore.setState({ cloudSyncStatus: 'syncing' });
        
        const data = {
          project,
          characters,
          relationships,
          plotThreads,
          convergenceEvents,
          scenes,
          timelineEvents,
          canonFacts,
          violations,
          milestones
        };
        
        await setDoc(doc(db, "users", firebaseUser.uid), data);
        useSettingsStore.setState({ cloudSyncStatus: 'synced' });
        alert("Project saved successfully!");
      } catch (err) {
        console.error("Save error", err);
        useSettingsStore.setState({ cloudSyncStatus: 'error' });
        alert("Failed to save project.");
      }
    };

    const loadFromFirestore = async () => {
      const { firebaseUser } = useAuthStore.getState();
      if (!firebaseUser) {
        alert("Please sign in to load from cloud.");
        return;
      }
      
      try {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.project) setProject(data.project);
          if (data.characters) setCharacters(data.characters);
          if (data.relationships) setRelationships(data.relationships);
          if (data.plotThreads) setPlotThreads(data.plotThreads);
          if (data.convergenceEvents) setConvergenceEvents(data.convergenceEvents);
          if (data.scenes) setScenes(data.scenes);
          if (data.timelineEvents) setTimelineEvents(data.timelineEvents);
          if (data.canonFacts) setCanonFacts(data.canonFacts);
          if (data.violations) setViolations(data.violations);
          if (data.milestones) setMilestones(data.milestones);
          alert("Project loaded successfully!");
        } else {
          alert("No saved project found.");
        }
      } catch (err) {
        console.error("Load error", err);
        alert("Failed to load project.");
      }
    };

    useSettingsStore.setState({
      saveProject: saveToFirestore,
      syncToCloud: saveToFirestore,
      loadProject: loadFromFirestore
    });
  }, [
    project, characters, relationships, plotThreads, convergenceEvents, 
    scenes, timelineEvents, canonFacts, violations, milestones
  ]);
`;

code = code.replace('const [soundEnabled, setSoundEnabled] = useState<boolean>(true);', 'const [soundEnabled, setSoundEnabled] = useState<boolean>(true);\n' + saveLogic);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with Firestore integration");
