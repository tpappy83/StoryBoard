const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
`;

code = code.replace("import { auth } from './firebase';", imports + "import { auth } from './firebase';");

const syncEffect = `
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          const docRef = doc(db, 'projects', user.uid);
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
            if (data.structureMilestones) setStructureMilestones(data.structureMilestones);
            if (data.setups) useSetupPayoffStore.getState().setSetups(data.setups);
            if (data.payoffs) useSetupPayoffStore.getState().setPayoffs(data.payoffs);
          }
        } catch (err) {
          console.error("Failed to load project from Firestore", err);
        }
      };
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const saveData = async () => {
        try {
          await setDoc(doc(db, 'projects', user.uid), {
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
          }, { merge: true });
        } catch (err) {
          console.error("Failed to save to Firestore", err);
        }
      };
      const timeoutId = setTimeout(saveData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [
    user, project, characters, relationships, plotThreads, convergenceEvents,
    scenes, timelineEvents, canonFacts, violations, structureMilestones
  ]);
`;

code = code.replace("const [soundEnabled, setSoundEnabled] = useState<boolean>(true);", "const [soundEnabled, setSoundEnabled] = useState<boolean>(true);\n" + syncEffect);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with Firestore sync");
