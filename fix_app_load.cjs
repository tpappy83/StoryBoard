const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'if (data.structureMilestones) setStructureMilestones(data.structureMilestones);',
  'if (data.structureMilestones) setStructureMilestones(data.structureMilestones);\n          if (data.setups) useSetupPayoffStore.setState({ setups: data.setups });\n          if (data.payoffs) useSetupPayoffStore.setState({ payoffs: data.payoffs });'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed App load");
