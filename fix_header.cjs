const fs = require('fs');
const path = './src/components/HeaderTransport.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure AppMenu is imported
if (!content.includes('AppMenu')) {
  content = content.replace(
    /import { ThreeDotActionsBar } from '\.\/ThreeDotActionsBar';/,
    `import { ThreeDotActionsBar } from './ThreeDotActionsBar';\nimport { AppMenu } from './AppMenu';`
  );
}

// Add AppMenu to the UI next to the HelpCircle button
content = content.replace(
  /\{\/\* Guided Walkthrough \*\/\}/,
  `{/* App Main Menu */}\n        <AppMenu />\n\n        {/* Guided Walkthrough */}`
);

fs.writeFileSync(path, content);
