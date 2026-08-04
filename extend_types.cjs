const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const sceneMatch = "export interface Scene {";
const newScene = `export interface Scene {
  createdAt?: string;
  updatedAt?: string;
  order?: number;
  notes?: string;
  charactersReferenced?: string[];
  fullContent?: string;`;
code = code.replace(sceneMatch, newScene);

const charMatch = "export interface Character {";
const newChar = `export interface Character {
  createdAt?: string;
  updatedAt?: string;
  demographics?: {
    age?: number | string;
    gender?: string;
    ethnicity?: string;
  };
  notes?: string;
  summary?: string;
  firstAppearanceSceneId?: string;`;
code = code.replace(charMatch, newChar);

const projMatch = "export interface ProjectMetadata {";
const newProj = `export interface ProjectMetadata {
  createdAt?: string;
  updatedAt?: string;
  lastSync?: string;
  episodeId?: string;
  currentSceneId?: string;
  currentCharacterId?: string;
  autoSaveEnabled?: boolean;
  autoSyncEnabled?: boolean;`;
code = code.replace(projMatch, newProj);

fs.writeFileSync('src/types.ts', code);
console.log("Types extended");
