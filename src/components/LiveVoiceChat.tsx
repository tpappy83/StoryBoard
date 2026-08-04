import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Settings, Volume2, Square, RefreshCcw } from 'lucide-react';

export const LiveVoiceChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startConnection = async () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
      wsRef.current = ws;

      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;
      
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputAudioCtx;
      nextStartTimeRef.current = outputAudioCtx.currentTime;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio) {
          playAudioChunk(outputAudioCtx, msg.audio);
        }
        if (msg.interrupted) {
          if (outputAudioCtxRef.current) {
            outputAudioCtxRef.current.close();
            const newOutCtx = new AudioContext({ sampleRate: 24000 });
            outputAudioCtxRef.current = newOutCtx;
            nextStartTimeRef.current = newOutCtx.currentTime;
          }
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        stopAudio();
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputAudioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isMuted) {
          const channelData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            let s = Math.max(-1, Math.min(1, channelData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          const buffer = new ArrayBuffer(pcm16.length * 2);
          const view = new DataView(buffer);
          for (let i = 0; i < pcm16.length; i++) {
            view.setInt16(i * 2, pcm16[i], true); // little endian
          }
          
          const binary = String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
          const base64 = btoa(binary);
          
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

    } catch (err) {
      console.error("Error starting live voice chat:", err);
      setIsConnected(false);
    }
  };

  const playAudioChunk = (audioCtx: AudioContext, base64Audio: string) => {
    const binary = atob(base64Audio);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const pcm16 = new Int16Array(bytes.buffer);
    const audioBuffer = audioCtx.createBuffer(1, pcm16.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm16.length; i++) {
      channelData[i] = pcm16[i] / 0x8000;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    
    const startTime = Math.max(audioCtx.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;
  };

  const stopAudio = () => {
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
    if (outputAudioCtxRef.current) outputAudioCtxRef.current.close();
  };

  const stopConnection = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopAudio();
    setIsConnected(false);
  };

  const toggleConnection = () => {
    if (isConnected) {
      stopConnection();
    } else {
      startConnection();
    }
  };

  useEffect(() => {
    return () => stopConnection();
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white"
        style={{ width: '60px', height: '60px' }}
      >
        {isConnected ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-[#141B2D] border border-indigo-500/30 rounded-2xl shadow-2xl p-4 z-50 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE WRITER'S ROOM
            </h3>
          </div>
          
          <div className="text-xs text-slate-400">
            Connect to the Live Narrative Engine for real-time voice consultations. Discuss plot holes, character arcs, or brainstorm scenes.
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={toggleConnection}
              className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                isConnected 
                  ? 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900' 
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
              }`}
            >
              {isConnected ? (
                <><Square className="w-4 h-4" /> DISCONNECT</>
              ) : (
                <><Mic className="w-4 h-4" /> CONNECT</>
              )}
            </button>
            
            {isConnected && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                  isMuted 
                    ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                    : 'bg-[#1A2338] text-slate-300 border border-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? 'UNMUTE MIC' : 'MUTE MIC'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
