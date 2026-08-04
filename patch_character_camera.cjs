const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterIntelligence.tsx', 'utf8');

const imports = `import React, { useState, useRef } from 'react';
import { Character, CharacterStatus } from '../types';
import { User, Shield, Key, Target, Heart, Award, Eye, EyeOff, Plus, Edit3, Lock, Camera } from 'lucide-react';
`;

code = code.replace(/import React, \{ useState \} from 'react';\nimport \{ Character, CharacterStatus \} from '\.\.\/types';\nimport \{ [^}]+ \} from 'lucide-react';/m, imports);

// Add camera ref and handler inside the component
const handlerCode = `
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChar) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to save Firestore space
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onUpdateCharacter({ ...activeChar, portraitUrl: dataUrl });
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };
`;

code = code.replace("const toggleSecrets = (charId: string) => {", handlerCode + "\n  const toggleSecrets = (charId: string) => {");

const avatarUI = `
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={activeChar.portraitUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={activeChar.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500/60 shadow-lg group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="user" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleCapturePhoto} 
                  />
                </div>
`;

code = code.replace(/<img\s*src=\{activeChar\.portraitUrl[^>]+>\s*/m, avatarUI);

fs.writeFileSync('src/components/CharacterIntelligence.tsx', code);
console.log("Patched camera");
