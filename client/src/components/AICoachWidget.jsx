import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Trash2,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const AICoachWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('repx_ai_coach_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-1',
        sender: 'coach',
        text: `Hey ${user?.name?.split(' ')[0] || 'Athlete'}! 💪 I'm your **REPX AI Coach**.\n\nAsk me any doubt about **exercise form & biomechanics**, **push-pull-legs splits**, **pre/post-workout nutrition**, **progressive overload**, **recovery**, or how to use **voice logging** in REPX!\n\nWhat are you working on today?`,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);
  const [speechVoiceEnabled, setSpeechVoiceEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('repx_ai_coach_messages', JSON.stringify(messages.slice(-30)));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (speechSynthesisActive) {
      setSpeechSynthesisActive(false);
      return;
    }

    // Clean markdown symbols for cleaner voice speech
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/•/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeechSynthesisActive(false);
    utterance.onerror = () => setSpeechSynthesisActive(false);

    setSpeechSynthesisActive(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('repx_token');
      const res = await axios.post(
        '/api/ai/coach',
        {
          message: textToSend,
          context: {
            name: user?.name,
            fitnessGoal: user?.fitnessGoal || 'Strength & Hypertrophy',
            experienceLevel: user?.experienceLevel || 'Intermediate',
            currentStreak: user?.streak || 0
          }
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      const replyText = res.data?.reply || 'I am ready to help you with your fitness goals.';

      const coachMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: replyText,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, coachMsg]);

      if (speechVoiceEnabled) {
        speakText(replyText);
      }
    } catch (err) {
      console.error('AI Coach error:', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: 'Sorry athlete, I encountered a temporary connection issue. Please make sure the REPX server is active and try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear your AI Coach chat history?')) {
      const reset = [
        {
          id: 'welcome-reset',
          sender: 'coach',
          text: `Chat history cleared! Ready for your next gym doubt, ${user?.name?.split(' ')[0] || 'Athlete'}. Ask me anything!`,
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(reset);
      localStorage.setItem('repx_ai_coach_messages', JSON.stringify(reset));
      window.speechSynthesis?.cancel();
      setSpeechSynthesisActive(false);
    }
  };

  // Quick Doubt suggestion pills
  const quickDoubts = [
    '🏋️ How to bench press with proper form?',
    '🥗 What should I eat pre & post workout?',
    '📈 How does progressive overload work?',
    '⏱️ How much rest should I take between sets?',
    '⚡ Recommend a 4-day workout split',
    '🎙️ How do I voice log my sets in REPX?',
    '🩹 How to avoid shoulder pain during chest press?'
  ];

  // Helper to render formatted text with bold, bullets, headings
  const renderFormattedText = (raw) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Heading level 3 or 4
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-repx-volt font-bold text-sm mt-2 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={idx} className="font-bold text-white text-xs mt-2 mb-0.5">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      // Bullet point
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const content = line.trim().replace(/^[-•]\s*/, '');
        return (
          <div key={idx} className="text-xs text-slate-200 flex items-start gap-1.5 ml-1 my-0.5">
            <span className="text-repx-volt font-bold">•</span>
            <span>{parseInlineBold(content)}</span>
          </div>
        );
      }
      // Numbered point
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="text-xs text-slate-200 flex items-start gap-1.5 ml-1 my-0.5">
            <span className="text-repx-volt font-semibold">{line.trim().match(/^\d+\./)[0]}</span>
            <span>{parseInlineBold(line.trim().replace(/^\d+\.\s*/, ''))}</span>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-200 leading-relaxed my-0.5">
          {parseInlineBold(line)}
        </p>
      );
    });
  };

  const parseInlineBold = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="text-repx-volt not-italic font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 150);
          }}
          aria-label="Open REPX AI Coach"
          className="fixed bottom-20 lg:bottom-6 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-repx-900/95 hover:bg-repx-850 text-white border border-repx-volt/60 rounded-full shadow-2xl hover:border-repx-volt transition-all duration-300 group hover:scale-105 active:scale-95 shadow-volt-glow backdrop-blur-md"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-repx-volt/20 border border-repx-volt/80 flex items-center justify-center text-repx-volt group-hover:bg-repx-volt group-hover:text-black transition-colors">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-repx-950 rounded-full animate-pulse" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <div className="text-xs font-black tracking-wide font-display text-white flex items-center gap-1.5">
              REPX AI COACH
              <span className="text-[9px] bg-repx-volt/20 text-repx-volt px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                ONLINE
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Ask any fitness doubt</div>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[440px] h-[600px] max-h-[85vh] bg-repx-950/98 border border-repx-borderLight rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-3.5 bg-repx-900 border-b border-repx-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-repx-volt/15 border border-repx-volt/50 flex items-center justify-center text-repx-volt shadow-volt-glow">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-repx-900 rounded-full" />
              </div>
              <div>
                <div className="text-xs font-black tracking-wide font-display text-white flex items-center gap-1.5">
                  REPX AI COACH
                  <span className="text-[9px] bg-repx-volt text-black px-1.5 py-0.2 rounded font-black tracking-wider uppercase">
                    AI 2.0
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Sports Science & Biomechanics Assistant
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Voice Speech Toggle */}
              <button
                onClick={() => {
                  setSpeechVoiceEnabled(!speechVoiceEnabled);
                  if (speechSynthesisActive) {
                    window.speechSynthesis?.cancel();
                    setSpeechSynthesisActive(false);
                  }
                }}
                title={speechVoiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
                className={`p-1.5 rounded-lg transition-colors ${
                  speechVoiceEnabled ? 'text-repx-volt bg-repx-volt/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                {speechVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Maximize to full page */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/coach');
                }}
                title="Expand to Full Page Coach"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-repx-800 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Clear History */}
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-repx-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close Widget */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.speechSynthesis?.cancel();
                  setSpeechSynthesisActive(false);
                }}
                title="Close AI Coach"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-repx-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Doubt Suggestion Pills (Horizontally scrollable) */}
          <div className="px-3 py-2 bg-repx-900/60 border-b border-repx-border/50 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-repx-volt" /> Ask:
            </span>
            {quickDoubts.map((doubt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(doubt)}
                className="text-[11px] whitespace-nowrap bg-repx-850 hover:bg-repx-800 hover:text-white text-slate-300 border border-repx-borderLight hover:border-repx-volt/40 px-2.5 py-1 rounded-full transition-all shrink-0 active:scale-95"
              >
                {doubt}
              </button>
            ))}
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-repx-borderLight">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-repx-volt/20 to-repx-volt/10 border border-repx-volt/40 text-white rounded-br-none'
                        : 'bg-repx-900 border border-repx-borderLight text-slate-100 rounded-bl-none shadow-lg'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-repx-volt uppercase tracking-wider">
                          <Bot className="w-3 h-3" /> REPX COACH
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Copy reply"
                            className="p-1 hover:text-white text-slate-400 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => speakText(msg.text)}
                            title="Read aloud"
                            className="p-1 hover:text-repx-volt text-slate-400 transition-colors"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div>{isUser ? msg.text : renderFormattedText(msg.text)}</div>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-repx-900 border border-repx-border flex items-center justify-center text-repx-volt">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-repx-900 border border-repx-borderLight rounded-2xl rounded-bl-none p-3 max-w-[80%]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-repx-volt animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-repx-volt animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-repx-volt animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] text-slate-400 ml-1.5">Coach is analyzing biomechanics...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening Waveform banner */}
          {isListening && (
            <div className="px-3 py-1.5 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between text-rose-400 text-xs shrink-0 animate-pulse">
              <div className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 animate-bounce text-rose-500" />
                <span className="font-semibold">Listening to your doubt... speak now!</span>
              </div>
              <button
                onClick={toggleVoiceInput}
                className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded uppercase"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-repx-900 border-t border-repx-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? 'Stop listening' : 'Ask doubt by voice'}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-rose-500/50'
                    : 'bg-repx-850 hover:bg-repx-800 text-slate-300 hover:text-white border-repx-borderLight'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask any doubt (e.g. How to squat deeper?)"
                className="flex-1 bg-repx-950 border border-repx-borderLight focus:border-repx-volt text-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-slate-400"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 rounded-xl bg-repx-volt text-black hover:bg-repx-voltHover disabled:opacity-40 disabled:hover:bg-repx-volt transition-all shadow-volt-glow font-bold shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 px-1">
              <span>⚡ Powered by REPX Biomechanics Engine</span>
              <span className="flex items-center gap-1 text-slate-400">
                🎙️ Voice Enabled
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AICoachWidget;
