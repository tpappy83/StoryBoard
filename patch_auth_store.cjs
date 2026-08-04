const fs = require('fs');

const code = `import { create } from 'zustand';
import { auth, googleAuthProvider } from '../firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'microsoft' | 'custom';
}

interface AuthStore {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  firebaseUser: User | null;
  signIn: (provider: UserProfile['provider']) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  userProfile: null,
  firebaseUser: null,
  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({
          isAuthenticated: true,
          firebaseUser: user,
          userProfile: {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            avatarUrl: user.photoURL || undefined,
            provider: 'google'
          }
        });
      } else {
        set({ isAuthenticated: false, firebaseUser: null, userProfile: null });
      }
    });
  },
  signIn: async (provider) => {
    if (provider === 'google' || provider === 'microsoft') {
      try {
        await signInWithPopup(auth, googleAuthProvider);
      } catch (e) {
        console.error("Sign in failed", e);
      }
    }
  },
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error("Sign out failed", e);
    }
  }
}));
`;

fs.writeFileSync('src/stores/authStore.ts', code);
console.log("Patched authStore.ts");
