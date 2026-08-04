const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterIntelligence.tsx', 'utf8');

const newCancelBtn = `<button
                onClick={() => {
                  setPreviewPhotoUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                    fileInputRef.current.click();
                  }
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition-colors"
              >
                RETAKE
              </button>`;

code = code.replace(
  /<button\s+onClick=\{\(\) => setPreviewPhotoUrl\(null\)\}\s+className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition-colors"\s*>\s*CANCEL\s*<\/button>/,
  newCancelBtn
);

code = code.replace(
  />\s*CONFIRM\s*<\/button>/,
  '>\n                Confirm Update\n              </button>'
);

fs.writeFileSync('src/components/CharacterIntelligence.tsx', code);
console.log("Patched buttons in modal");
