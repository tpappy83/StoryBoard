const fs = require('fs');

let headerCode = fs.readFileSync('src/components/HeaderTransport.tsx', 'utf8');

headerCode = headerCode.replace(
  "import { Scene, Character, PlotThread, CanonFact, SetupPayoffEvent, SelectedNarrativeObject } from '../types';",
  "import { Scene, Character, PlotThread, CanonFact, SetupPayoffEvent, SelectedNarrativeObject, SceneProposal } from '../types';"
);

headerCode = headerCode.replace(
  "interface HeaderTransportProps {\n  scenes?: Scene[];",
  "interface HeaderTransportProps {\n  scenes?: Scene[];\n  proposals?: SceneProposal[];"
);

headerCode = headerCode.replace(
  "  scenes,\n  scene,",
  "  scenes,\n  proposals,\n  scene,"
);

headerCode = headerCode.replace(
  "generateProjectPDF({\n        project,\n        scenes,\n        characters\n      });",
  "generateProjectPDF({\n        project,\n        scenes,\n        proposals,\n        characters\n      });"
);

headerCode = headerCode.replace(
  "generateProjectDOCX({\n        project,\n        scenes,\n        characters\n      });",
  "generateProjectDOCX({\n        project,\n        scenes,\n        proposals,\n        characters\n      });"
);

fs.writeFileSync('src/components/HeaderTransport.tsx', headerCode);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  "scene={selectedScene || scenes[0]}",
  "proposals={proposals}\n        scene={selectedScene || scenes[0]}"
);
fs.writeFileSync('src/App.tsx', appCode);

console.log("Updated HeaderTransport and App");
