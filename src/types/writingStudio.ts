export type WritingMedium = 
  | 'screenplay'
  | 'novel'
  | 'magazine'
  | 'short_story'
  | 'stage_play'
  | 'comic_script'
  | 'custom';

export type ScreenplayBlockType =
  | 'slugline'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'
  | 'shot';

export type NovelBlockType =
  | 'chapter_title'
  | 'section_subhead'
  | 'prose'
  | 'pov_break'
  | 'pull_quote';

export type MagazineBlockType =
  | 'headline'
  | 'deck'
  | 'lede'
  | 'nut_graf'
  | 'body_section'
  | 'sidebar'
  | 'callout';

export type StagePlayBlockType =
  | 'act_heading'
  | 'scene_heading'
  | 'stage_direction'
  | 'character'
  | 'dialogue'
  | 'beat';

export type ComicScriptBlockType =
  | 'page_heading'
  | 'panel_heading'
  | 'panel_description'
  | 'caption'
  | 'balloon_character'
  | 'balloon_dialogue'
  | 'sfx';

export type CustomBlockType =
  | 'heading'
  | 'subheading'
  | 'body'
  | 'note'
  | 'metadata';

export type WritingBlockType =
  | ScreenplayBlockType
  | NovelBlockType
  | MagazineBlockType
  | StagePlayBlockType
  | ComicScriptBlockType
  | CustomBlockType;

export interface WritingBlock {
  id: string;
  type: WritingBlockType;
  text: string;
  characterId?: string;
  locationId?: string;
  plotThreadId?: string;
  setupId?: string;
  notes?: string;
  pageNumber?: number;
  panelNumber?: number;
  actNumber?: number;
  sceneNumber?: number;
  chapterNumber?: number;
  meta?: Record<string, any>;
}

export interface WritingMediumPreset {
  medium: WritingMedium;
  label: string;
  iconName: string;
  description: string;
  defaultFontFamily: string;
  pageSize: 'letter' | 'a4' | 'continuous';
  isPageBased: boolean;
  blockTypes: {
    type: WritingBlockType;
    label: string;
    shortcut: string;
    className: string;
    autoNextType: WritingBlockType;
    placeholder: string;
  }[];
  structuralHierarchyName: string;
}

export interface WritingStudioMetadata {
  logline?: string;
  genre?: string;
  targetWordCount?: number;
  issueNumber?: string;
  actStructure?: string;
  publicationName?: string;
  povCharacterId?: string;
  targetPageCount?: number;
  customRules?: string;
}

export interface WritingStudioDoc {
  id: string;
  title: string;
  medium: WritingMedium;
  blocks: WritingBlock[];
  metadata: WritingStudioMetadata;
  createdAt: string;
  updatedAt: string;
}

export type WritingStudioAiTool =
  | 'format_aware_rewrite'
  | 'scene_to_screenplay'
  | 'prose_to_dialogue'
  | 'chapter_expansion'
  | 'magazine_lede_generator'
  | 'comic_panel_breakdown'
  | 'stage_play_beat_mapping'
  | 'multi_pass_revision';
