const fs = require('fs');
const path = './src/components/NarrativeNavigator.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const \{\s*isNavigatorCollapsed,/g,
  `const { startDrag } = useDragObject();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Projects: true,
    Characters: true,
    Scenes: true,
    'Plot Threads': true
  });
  
  const {
    isNavigatorCollapsed,`
);

fs.writeFileSync(path, content);
