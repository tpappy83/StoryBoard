import { WritingMediumPreset, WritingMedium } from '../types/writingStudio';

export const WRITING_MEDIUM_PRESETS: Record<WritingMedium, WritingMediumPreset> = {
  screenplay: {
    medium: 'screenplay',
    label: 'Screenplay',
    iconName: 'Clapperboard',
    description: 'Industry-standard Final Draft format (12pt Courier, sluglines, dialogue indentation, transitions).',
    defaultFontFamily: 'Courier Prime, Courier, monospace',
    pageSize: 'letter',
    isPageBased: true,
    structuralHierarchyName: 'Scenes & Beats',
    blockTypes: [
      {
        type: 'slugline',
        label: 'Scene Heading (Slugline)',
        shortcut: 'INT/EXT',
        className: 'font-bold uppercase tracking-wider text-amber-300 mt-6 mb-2',
        autoNextType: 'action',
        placeholder: 'INT. CITADEL COMMAND - NIGHT'
      },
      {
        type: 'action',
        label: 'Action / Description',
        shortcut: 'Tab/Enter',
        className: 'text-slate-200 leading-relaxed my-2',
        autoNextType: 'action',
        placeholder: 'Rain lashes against the reinforced glass windows...'
      },
      {
        type: 'character',
        label: 'Character Name',
        shortcut: 'Cmd+Shift+C',
        className: 'font-bold uppercase tracking-widest text-indigo-300 text-center w-3/5 mx-auto mt-4 mb-0.5',
        autoNextType: 'dialogue',
        placeholder: 'CAPTAIN VANCE'
      },
      {
        type: 'parenthetical',
        label: 'Parenthetical',
        shortcut: 'Cmd+Shift+P',
        className: 'text-slate-400 italic text-center w-2/5 mx-auto mb-1',
        autoNextType: 'dialogue',
        placeholder: '(whispering frantically)'
      },
      {
        type: 'dialogue',
        label: 'Dialogue',
        shortcut: 'Cmd+Shift+D',
        className: 'text-slate-100 text-center w-2/3 mx-auto mb-3 leading-snug',
        autoNextType: 'character',
        placeholder: 'If the energy core fails, Sector 4 drops into darkness.'
      },
      {
        type: 'transition',
        label: 'Transition',
        shortcut: 'Cmd+Shift+T',
        className: 'font-bold uppercase text-right text-purple-300 my-4 pr-6',
        autoNextType: 'slugline',
        placeholder: 'CUT TO:'
      },
      {
        type: 'shot',
        label: 'Shot / Angle',
        shortcut: 'Cmd+Shift+S',
        className: 'font-bold uppercase text-slate-300 mt-3 mb-1',
        autoNextType: 'action',
        placeholder: 'ANGLE ON THE CONTROL CONSOLE'
      }
    ]
  },

  novel: {
    medium: 'novel',
    label: 'Novel Manuscript',
    iconName: 'BookOpen',
    description: 'Classic chapter-based prose with subheads, POV shifts, and indented paragraphs.',
    defaultFontFamily: 'Georgia, Cambria, serif',
    pageSize: 'continuous',
    isPageBased: false,
    structuralHierarchyName: 'Chapters & POV Shifts',
    blockTypes: [
      {
        type: 'chapter_title',
        label: 'Chapter Title',
        shortcut: 'H1',
        className: 'text-2xl font-bold text-slate-100 text-center my-8 font-serif tracking-wide border-b border-[#1E293B] pb-3',
        autoNextType: 'prose',
        placeholder: 'Chapter 1: Shadows Over the Canopy'
      },
      {
        type: 'section_subhead',
        label: 'Section Subhead',
        shortcut: 'H2',
        className: 'text-lg font-semibold text-indigo-300 my-4 font-serif',
        autoNextType: 'prose',
        placeholder: 'I. The Gathering Storm'
      },
      {
        type: 'prose',
        label: 'Prose Paragraph',
        shortcut: 'Enter',
        className: 'text-slate-200 font-serif leading-relaxed text-base mb-4 indent-6 text-justify',
        autoNextType: 'prose',
        placeholder: 'The ancient spire rose out of the mist like a shattered spearhead...'
      },
      {
        type: 'pov_break',
        label: 'POV / Scene Break',
        shortcut: '***',
        className: 'text-center font-bold text-slate-500 my-6 tracking-widest',
        autoNextType: 'prose',
        placeholder: '* * *'
      },
      {
        type: 'pull_quote',
        label: 'Epigraph / Pull Quote',
        shortcut: 'Quote',
        className: 'italic text-indigo-200/90 border-l-2 border-indigo-500 pl-4 my-6 font-serif text-sm',
        autoNextType: 'prose',
        placeholder: '"History is written by those who survive the storm."'
      }
    ]
  },

  magazine: {
    medium: 'magazine',
    label: 'Magazine Article',
    iconName: 'Newspaper',
    description: 'Journalistic layout featuring ledes, nut-grafs, body sections, sidebars, and callouts.',
    defaultFontFamily: 'Inter, system-ui, sans-serif',
    pageSize: 'continuous',
    isPageBased: false,
    structuralHierarchyName: 'Journalistic Structure',
    blockTypes: [
      {
        type: 'headline',
        label: 'Headline',
        shortcut: 'Title',
        className: 'text-3xl font-extrabold text-slate-100 my-4 tracking-tight leading-tight',
        autoNextType: 'deck',
        placeholder: 'The Silent Collapse of Sector 4'
      },
      {
        type: 'deck',
        label: 'Deck / Subtitle',
        shortcut: 'Deck',
        className: 'text-lg text-slate-400 font-medium mb-6 italic border-b border-[#1E293B] pb-4',
        autoNextType: 'lede',
        placeholder: 'How a single corrupted relay node exposed the fragile inner machinery of the council.'
      },
      {
        type: 'lede',
        label: 'Lede (Opening)',
        shortcut: 'Lede',
        className: 'text-base font-semibold text-slate-200 leading-relaxed my-3 text-indigo-100 bg-indigo-950/20 p-3 rounded-lg border-l-4 border-indigo-500',
        autoNextType: 'nut_graf',
        placeholder: 'Inside the damp sub-basements of Sector 4, sirens do not sound when power dies—only a cold, mechanical click.'
      },
      {
        type: 'nut_graf',
        label: 'Nut-graf (Core Thesis)',
        shortcut: 'NutGraf',
        className: 'text-sm text-amber-200/90 font-medium my-4 bg-amber-950/20 p-3 rounded-lg border border-amber-500/30',
        autoNextType: 'body_section',
        placeholder: 'This vulnerability isn’t just an engineering failure; it’s the climax of a ten-year political rivalry.'
      },
      {
        type: 'body_section',
        label: 'Body Paragraph',
        shortcut: 'Body',
        className: 'text-slate-300 leading-relaxed my-3 text-sm',
        autoNextType: 'body_section',
        placeholder: 'Witnesses report seeing high-ranking liaisons departing minutes before the grid failed...'
      },
      {
        type: 'sidebar',
        label: 'Sidebar Box',
        shortcut: 'Sidebar',
        className: 'my-6 p-4 bg-[#0B1020] border border-indigo-500/40 rounded-xl text-xs text-indigo-200 space-y-1 shadow-lg',
        autoNextType: 'body_section',
        placeholder: 'SIDEBAR: Key Figures Involved in Sector 4 Grid Maintenance'
      },
      {
        type: 'callout',
        label: 'Callout Quote',
        shortcut: 'Callout',
        className: 'my-6 text-xl font-bold text-center text-amber-300 px-8 italic border-y border-amber-500/30 py-4',
        autoNextType: 'body_section',
        placeholder: '“We knew the relay was failing, but nobody dared speak up.”'
      }
    ]
  },

  short_story: {
    medium: 'short_story',
    label: 'Short Story',
    iconName: 'Feather',
    description: 'Compact narrative structure with tight focus on arc, scene transitions, and theme.',
    defaultFontFamily: 'Georgia, serif',
    pageSize: 'continuous',
    isPageBased: false,
    structuralHierarchyName: 'Story Beats',
    blockTypes: [
      {
        type: 'chapter_title',
        label: 'Story Title',
        shortcut: 'Title',
        className: 'text-2xl font-bold text-slate-100 text-center my-6 font-serif',
        autoNextType: 'prose',
        placeholder: 'The Last Echo of Sector 4'
      },
      {
        type: 'prose',
        label: 'Narrative Prose',
        shortcut: 'Enter',
        className: 'text-slate-200 font-serif leading-relaxed text-base mb-4 indent-4',
        autoNextType: 'prose',
        placeholder: 'The air tasted of ozone and old dust as Vance stepped across the threshold.'
      },
      {
        type: 'pov_break',
        label: 'Beat Break',
        shortcut: 'Break',
        className: 'text-center font-bold text-slate-500 my-5',
        autoNextType: 'prose',
        placeholder: '◇ ◇ ◇'
      }
    ]
  },

  stage_play: {
    medium: 'stage_play',
    label: 'Stage Play',
    iconName: 'Drama',
    description: 'Theatrical script formatting (Acts, Scenes, Stage Directions/Blocking, and Dialogues).',
    defaultFontFamily: 'Courier Prime, Courier, monospace',
    pageSize: 'a4',
    isPageBased: true,
    structuralHierarchyName: 'Acts & Stage Scenes',
    blockTypes: [
      {
        type: 'act_heading',
        label: 'Act Heading',
        shortcut: 'Act',
        className: 'text-xl font-extrabold uppercase text-center text-rose-400 my-6 tracking-widest underline decoration-rose-500/40',
        autoNextType: 'scene_heading',
        placeholder: 'ACT I'
      },
      {
        type: 'scene_heading',
        label: 'Scene Heading',
        shortcut: 'Scene',
        className: 'text-base font-bold uppercase text-center text-amber-300 my-4 tracking-wider',
        autoNextType: 'stage_direction',
        placeholder: 'SCENE 1: THE OBSCURA CHAMBER'
      },
      {
        type: 'stage_direction',
        label: 'Stage Direction / Blocking',
        shortcut: 'Blocking',
        className: 'text-slate-400 italic text-center px-12 my-3 text-xs leading-relaxed',
        autoNextType: 'character',
        placeholder: '[LIGHTS FADE UP on VANCE standing center stage beside a rusted console. A storm rumbles outside.]'
      },
      {
        type: 'character',
        label: 'Character Name',
        shortcut: 'Char',
        className: 'font-bold uppercase text-indigo-300 text-center mt-4 mb-0.5 tracking-widest',
        autoNextType: 'dialogue',
        placeholder: 'VANCE'
      },
      {
        type: 'dialogue',
        label: 'Dialogue',
        shortcut: 'Dialogue',
        className: 'text-slate-100 text-center w-3/4 mx-auto mb-3 text-sm leading-relaxed',
        autoNextType: 'character',
        placeholder: 'Is anyone listening on this frequency?'
      },
      {
        type: 'beat',
        label: 'Pause / Beat',
        shortcut: 'Beat',
        className: 'text-center italic text-slate-500 text-xs my-2',
        autoNextType: 'dialogue',
        placeholder: '(Beat.)'
      }
    ]
  },

  comic_script: {
    medium: 'comic_script',
    label: 'Comic Script',
    iconName: 'LayoutGrid',
    description: 'Comic book script structure (Pages, Panels, Descriptions, Captions, Balloons, SFX).',
    defaultFontFamily: 'Consolas, monospace',
    pageSize: 'a4',
    isPageBased: true,
    structuralHierarchyName: 'Pages & Panels',
    blockTypes: [
      {
        type: 'page_heading',
        label: 'Page Heading',
        shortcut: 'Page',
        className: 'text-lg font-black uppercase text-center text-amber-400 bg-amber-950/30 p-2 my-4 rounded border border-amber-500/40 tracking-widest',
        autoNextType: 'panel_heading',
        placeholder: 'PAGE 1 (FULL SPLASH PAGE)'
      },
      {
        type: 'panel_heading',
        label: 'Panel Heading',
        shortcut: 'Panel',
        className: 'font-bold uppercase text-indigo-300 bg-indigo-950/40 p-1.5 my-3 rounded border-l-4 border-indigo-500 text-xs tracking-wider',
        autoNextType: 'panel_description',
        placeholder: 'PANEL 1'
      },
      {
        type: 'panel_description',
        label: 'Panel Description / Visuals',
        shortcut: 'Visual',
        className: 'text-slate-300 text-xs leading-relaxed my-2 italic pl-4 border-l border-slate-700',
        autoNextType: 'balloon_character',
        placeholder: 'WIDE SHOT of the ruined skyline. Rain glimmers under neon advertisements.'
      },
      {
        type: 'caption',
        label: 'Caption Box',
        shortcut: 'Caption',
        className: 'bg-yellow-500/10 border border-yellow-500/30 p-2 text-yellow-200 text-xs font-mono my-2 rounded font-bold',
        autoNextType: 'panel_description',
        placeholder: 'CAPTION: "Sector 4 didn’t sleep that night."'
      },
      {
        type: 'balloon_character',
        label: 'Balloon Speaker',
        shortcut: 'Speaker',
        className: 'font-bold uppercase text-indigo-200 text-xs ml-6 mt-3 mb-0.5',
        autoNextType: 'balloon_dialogue',
        placeholder: '1. VANCE (BALLOON)'
      },
      {
        type: 'balloon_dialogue',
        label: 'Balloon Dialogue',
        shortcut: 'Balloon',
        className: 'text-slate-100 text-xs ml-10 mb-2 italic border-l-2 border-indigo-400 pl-2',
        autoNextType: 'balloon_character',
        placeholder: '"Check the emergency generator now!"'
      },
      {
        type: 'sfx',
        label: 'Sound Effect (SFX)',
        shortcut: 'SFX',
        className: 'text-rose-400 font-extrabold uppercase text-sm tracking-widest my-2 ml-4',
        autoNextType: 'panel_description',
        placeholder: 'SFX: KRAA-AKKK!'
      }
    ]
  },

  custom: {
    medium: 'custom',
    label: 'Custom Template',
    iconName: 'Settings2',
    description: 'User-definable flexible layout for specialized scripts, transcripts, or game designs.',
    defaultFontFamily: 'system-ui, sans-serif',
    pageSize: 'continuous',
    isPageBased: false,
    structuralHierarchyName: 'Document Sections',
    blockTypes: [
      {
        type: 'heading',
        label: 'Section Heading',
        shortcut: 'H1',
        className: 'text-xl font-bold text-slate-100 my-4 border-b border-[#1E293B] pb-2',
        autoNextType: 'body',
        placeholder: 'Section 1: Overview'
      },
      {
        type: 'subheading',
        label: 'Subheading',
        shortcut: 'H2',
        className: 'text-base font-semibold text-indigo-300 my-3',
        autoNextType: 'body',
        placeholder: '1.1 System Mechanics'
      },
      {
        type: 'body',
        label: 'Body Text',
        shortcut: 'Body',
        className: 'text-slate-200 text-sm leading-relaxed my-2',
        autoNextType: 'body',
        placeholder: 'Enter content details...'
      },
      {
        type: 'note',
        label: 'Design / Director Note',
        shortcut: 'Note',
        className: 'text-xs text-amber-300 bg-amber-950/20 p-2.5 rounded border border-amber-500/30 my-3 italic',
        autoNextType: 'body',
        placeholder: 'Note: Ensure continuity with Sector 4 lore.'
      },
      {
        type: 'metadata',
        label: 'Metadata Tag',
        shortcut: 'Meta',
        className: 'text-[11px] font-mono text-purple-300 bg-purple-950/30 p-1.5 rounded border border-purple-500/30 my-2',
        autoNextType: 'body',
        placeholder: 'TAGS: [Sector4, Vance, Conflict]'
      }
    ]
  }
};
