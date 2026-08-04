const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterIntelligence.tsx', 'utf8');

// Add state for previewPhotoUrl
code = code.replace(
  "const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});",
  "const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});\n  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);"
);

// Update handleCapturePhoto to set preview photo instead of immediately updating
code = code.replace(
  "onUpdateCharacter({ ...activeChar, portraitUrl: dataUrl });",
  "setPreviewPhotoUrl(dataUrl);"
);

// Add the modal JSX just before the return of the component or somewhere at the root of the returned JSX
const modalJsx = `
      {/* Photo Preview Modal */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141B2D] border border-indigo-500/50 rounded-xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Confirm Portrait Update</h3>
            <p className="text-xs text-slate-400">Are you sure you want to update {activeChar?.name}'s portrait with this image?</p>
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-indigo-500/50">
              <img src={previewPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex space-x-3 w-full pt-2">
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  if (activeChar) {
                    onUpdateCharacter({ ...activeChar, portraitUrl: previewPhotoUrl });
                  }
                  setPreviewPhotoUrl(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  "return (\n    <div className=\"bg-[#141B2D]",
  "return (\n    <>\n" + modalJsx + "\n    <div className=\"bg-[#141B2D]"
);

code = code.replace(
  /    <\/div>\n  \);\n\};/,
  "    </div>\n    </>\n  );\n};"
);

fs.writeFileSync('src/components/CharacterIntelligence.tsx', code);
console.log("Patched camera modal");
