import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing app or initialize
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const keepAuth = getAuth(app);

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface KeepNote {
  name?: string; // Resource name like 'notes/123'
  id: string;
  title: string;
  body: string;
  listItems?: { text: string; checked: boolean }[];
  labels?: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  isSyncedToGoogleKeep?: boolean;
}

export const initKeepAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(keepAuth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleKeep = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/keep');
    provider.addScope('https://www.googleapis.com/auth/keep.readonly');

    const result = await signInWithPopup(keepAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      // Fallback: create token from user id or user session
      cachedAccessToken = await result.user.getIdToken();
    } else {
      cachedAccessToken = credential.accessToken;
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Keep sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getKeepAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutKeep = async () => {
  await signOut(keepAuth);
  cachedAccessToken = null;
};

/**
 * Fetches notes from Google Keep API or fallback project memory
 */
export const fetchKeepNotes = async (
  accessToken: string | null
): Promise<KeepNote[]> => {
  if (accessToken) {
    try {
      const response = await fetch('https://keep.googleapis.com/v1/notes', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notes && Array.isArray(data.notes)) {
          return data.notes.map((n: any) => ({
            id: n.name || `keep_${Math.random().toString(36).substring(2, 9)}`,
            name: n.name,
            title: n.title || 'Untitled Note',
            body: n.body?.text?.text || n.textContent || '',
            createdAt: n.createTime || new Date().toISOString(),
            updatedAt: n.updateTime || new Date().toISOString(),
            isSyncedToGoogleKeep: true
          }));
        }
      }
    } catch (err) {
      console.warn('Google Keep REST API call fallback to local workspace storage:', err);
    }
  }

  // Return stored local Keep workspace notes
  const localNotes = localStorage.getItem('narrative_keep_notes');
  if (localNotes) {
    try {
      return JSON.parse(localNotes);
    } catch (e) {
      console.error(e);
    }
  }

  // Default seed notes for Google Keep
  return [
    {
      id: 'keep_seed_01',
      title: '📌 Foreshadowing: Ancient Silver Key',
      body: 'Introduced in Act 1, Scene 3. Keeps royal crest motif. Requires payoff before Act 3 Climax at Sector 7 vault door.',
      labels: ['Setup', 'Foreshadowing'],
      color: 'amber',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: true,
      isSyncedToGoogleKeep: !!accessToken
    },
    {
      id: 'keep_seed_02',
      title: '⚡ Climax Convergence Rules',
      body: '1. All 3 plot threads (Solstice Assembly, Core Mystery, Character Arc) must converge in Chapter 25.\n2. Liam\'s neurological poison code must detonate before Solstice ceremony.',
      labels: ['Rules', 'Canon'],
      color: 'purple',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isSyncedToGoogleKeep: !!accessToken
    }
  ];
};

/**
 * Creates a new note in Google Keep API or local workspace memory
 */
export const createKeepNote = async (
  accessToken: string | null,
  note: Omit<KeepNote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<KeepNote> => {
  const newNote: KeepNote = {
    ...note,
    id: `keep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSyncedToGoogleKeep: false
  };

  if (accessToken) {
    try {
      const response = await fetch('https://keep.googleapis.com/v1/notes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: note.title,
          body: { text: { text: note.body } }
        })
      });

      if (response.ok) {
        const resData = await response.json();
        newNote.name = resData.name;
        newNote.id = resData.name || newNote.id;
        newNote.isSyncedToGoogleKeep = true;
      }
    } catch (err) {
      console.warn('Direct Google Keep API write fallback:', err);
    }
  }

  // Persist locally
  const currentNotes = await fetchKeepNotes(accessToken);
  const updatedNotes = [newNote, ...currentNotes];
  localStorage.setItem('narrative_keep_notes', JSON.stringify(updatedNotes));

  return newNote;
};

/**
 * Deletes a note (Requires user confirmation before calling)
 */
export const deleteKeepNote = async (
  accessToken: string | null,
  noteId: string
): Promise<void> => {
  if (accessToken && noteId.startsWith('notes/')) {
    try {
      await fetch(`https://keep.googleapis.com/v1/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (err) {
      console.warn('Keep API delete fallback:', err);
    }
  }

  const localNotes = localStorage.getItem('narrative_keep_notes');
  if (localNotes) {
    try {
      const parsed: KeepNote[] = JSON.parse(localNotes);
      const filtered = parsed.filter(n => n.id !== noteId);
      localStorage.setItem('narrative_keep_notes', JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  }
};
