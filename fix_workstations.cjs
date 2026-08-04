const fs = require('fs');
const path = './src/components/HeaderTransport.tsx';
let content = fs.readFileSync(path, 'utf8');

const workstationsArray = `  // Workstation button definitions
  const workstations: {
    id: WorkspaceMode | 'ADVISORY';
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }[] = [
    {
      id: 'PLANNING',
      label: 'Navigator',
      icon: <Compass className="w-3.5 h-3.5" />,
      onClick: () => {
        if (onToggleNavigator) onToggleNavigator();
        setActiveWorkspace('PLANNING');
      }
    },
    {
      id: 'WRITING_STUDIO',
      label: 'Writing Studio',
      icon: <Clapperboard className="w-3.5 h-3.5 text-[#F2C94C]" />,
      onClick: () => setActiveWorkspace('WRITING_STUDIO')
    },
    {
      id: 'SIMULATION',
      label: 'Timeline',
      icon: <GitBranch className="w-3.5 h-3.5" />,
      onClick: () => setActiveWorkspace('SIMULATION')
    },
    {
      id: 'CHARACTER',
      label: 'Relationship Web',
      icon: <Users className="w-3.5 h-3.5" />,
      onClick: () => setActiveWorkspace('CHARACTER')
    },
    {
      id: 'WORLDBUILDING',
      label: 'Canon Vault',
      icon: <Globe className="w-3.5 h-3.5" />,
      onClick: () => setActiveWorkspace('WORLDBUILDING')
    },
    {
      id: 'ADVISORY',
      label: 'Advisory Council',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#F2C94C]" />,
      onClick: () => setActiveWorkspace('CUSTOM') // assuming ADVISORY maps to CUSTOM since there is no ADVISORY workspace mode
    },
    {
      id: 'CONTINUITY',
      label: 'Continuity Center',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      onClick: () => setActiveWorkspace('CONTINUITY')
    }
  ];

  return (`;

content = content.replace(/  return \(/, workstationsArray);

fs.writeFileSync(path, content);
