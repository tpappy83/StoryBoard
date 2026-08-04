import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectState: any;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  projectState
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg.text, 
          history: messages,
          context: projectState
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#000000] border-l border-[#1E293B] shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
        <div className="flex items-center space-x-2 text-[#94A3B8]">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-medium">Council Advisory Chat</h2>
        </div>
        <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 text-sm \${msg.role === 'user' ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/30' : 'bg-[#0B1020] text-[#94A3B8] border border-[#1E293B]'}`}>
              <div className="flex items-center space-x-2 mb-1">
                {msg.role === 'user' ? <User className="w-3 h-3 text-indigo-400" /> : <Bot className="w-3 h-3 text-emerald-400" />}
                <span className="text-xs font-semibold">{msg.role === 'user' ? 'You' : 'Council Advisor'}</span>
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#0B1020] text-[#94A3B8] border border-[#1E293B] rounded-lg p-3 text-sm flex items-center space-x-2">
              <Bot className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-[#1E293B] bg-[#000000]">
        <div className="flex items-center bg-[#0B1020] border border-[#1E293B] rounded-md p-1 focus-within:border-indigo-500/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the Council..."
            className="flex-1 bg-transparent text-sm text-[#E2E8F0] p-2 focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
