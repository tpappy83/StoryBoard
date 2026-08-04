import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Upload, LogIn, LogOut, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { initAuth, googleSignIn, logout, getAccessToken } from '../../lib/googleAuth';
import { User } from 'firebase/auth';

interface GoogleDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentContent: string;
  onImportContent: (content: string) => void;
}

export const GoogleDocsModal: React.FC<GoogleDocsModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentContent,
  onImportContent
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [docIdInput, setDocIdInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = initAuth(
        (u) => setUser(u),
        () => setUser(null)
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setStatusMessage({ type: 'success', text: 'Successfully signed in to Google.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to sign in. ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
      setStatusMessage({ type: 'info', text: 'Signed out.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to sign out. ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Creating Google Doc...' });
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      // Create a new document using Docs API
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: documentTitle || 'Untitled Document' })
      });
      
      if (!createRes.ok) throw new Error('Failed to create document');
      const createData = await createRes.json();
      const documentId = createData.documentId;

      // Insert text into the document
      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: documentContent
              }
            }
          ]
        })
      });

      if (!updateRes.ok) throw new Error('Failed to insert content');
      
      setStatusMessage({ type: 'success', text: `Exported successfully! Doc ID: ${documentId}` });
      setDocIdInput(documentId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Export failed: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!docIdInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a Document ID.' });
      return;
    }
    
    // Warn user about overwrite
    const confirmed = window.confirm(`Are you sure you want to import from this Google Doc? This will overwrite the current content in your Writing Studio.`);
    if (!confirmed) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Fetching document...' });
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      // Fetch the document using Docs API
      const res = await fetch(`https://docs.googleapis.com/v1/documents/${docIdInput.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch document. Check the ID and your permissions.');
      const data = await res.json();
      
      // Extract text from the document content
      let fullText = '';
      if (data.body && data.body.content) {
        data.body.content.forEach((el: any) => {
          if (el.paragraph && el.paragraph.elements) {
            el.paragraph.elements.forEach((elem: any) => {
              if (elem.textRun && elem.textRun.content) {
                fullText += elem.textRun.content;
              }
            });
          }
        });
      }

      onImportContent(fullText.trim());
      setStatusMessage({ type: 'success', text: 'Successfully imported content!' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Import failed: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#0A2A43] border border-[#153B5C] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#153B5C]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#000000] p-2 rounded-lg border border-[#153B5C]">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Google Docs Integration</h2>
              <p className="text-[10px] text-[#C4C4C4]">Import and export manuscript data</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#C4C4C4] hover:text-white p-1 rounded hover:bg-[#0E3859] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {statusMessage && (
            <div className={`p-3 rounded-lg text-xs flex items-start space-x-2 border ${
              statusMessage.type === 'success' ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400' :
              statusMessage.type === 'error' ? 'bg-rose-950/50 border-rose-500/50 text-rose-400' :
              'bg-[#000000] border-[#153B5C] text-sky-400'
            }`}>
              {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {!user ? (
            <div className="bg-[#000000] border border-[#153B5C] p-6 rounded-lg text-center space-y-4">
              <div className="text-xs text-[#C4C4C4]">
                Sign in with your Google account to authorize access to Google Docs and Drive.
              </div>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="gsi-material-button w-full justify-center flex items-center disabled:opacity-50"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper flex items-center px-4 py-2 bg-white text-black rounded font-sans font-medium text-sm">
                  <div className="gsi-material-button-icon mr-3">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#000000] p-3 rounded-lg border border-[#153B5C]">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-[#153B5C]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-white font-bold">{user.displayName || 'Google User'}</div>
                    <div className="text-[10px] text-[#C4C4C4]">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="p-2 text-[#C4C4C4] hover:text-rose-400 hover:bg-[#0E3859] rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Export Card */}
                <div className="bg-[#000000] border border-[#153B5C] p-4 rounded-lg space-y-3">
                  <div className="flex items-center space-x-2 text-sky-400">
                    <Upload className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Export to Docs</span>
                  </div>
                  <p className="text-[10px] text-[#C4C4C4] leading-relaxed">
                    Create a new Google Document from your current Writing Studio manuscript.
                  </p>
                  <button
                    onClick={handleExport}
                    disabled={isLoading}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'CREATE NEW DOC'}
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-[#000000] border border-[#153B5C] p-4 rounded-lg space-y-3 flex flex-col">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Import from Docs</span>
                  </div>
                  <p className="text-[10px] text-[#C4C4C4] leading-relaxed">
                    Overwrite current manuscript with content from an existing Document.
                  </p>
                  <div className="mt-auto space-y-2">
                    <input
                      type="text"
                      placeholder="Enter Document ID..."
                      value={docIdInput}
                      onChange={(e) => setDocIdInput(e.target.value)}
                      className="w-full bg-[#0A2A43] text-white px-2 py-1.5 rounded border border-[#153B5C] focus:border-emerald-500/50 focus:outline-none text-xs"
                    />
                    <button
                      onClick={handleImport}
                      disabled={isLoading || !docIdInput.trim()}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'OVERWRITE MANUSCRIPT'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
