import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Download,
  Dumbbell,
  Apple,
  TrendingUp,
  ShieldAlert,
  Mic as VoiceIcon,
  CheckCircle2,
  Flame,
  User,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const AICoachPage = () => {
  const { user } = useAuth();

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
        id: 'welcome-page',
        sender: 'coach',
        text: `Welcome to the **REPX AI Coach Console**, ${user?.name || 'Athlete'}! ⚡\n\nI am your dedicated 24/7 sports science, biomechanics, and nutrition advisor. You can ask me any doubt regarding:\n\n• **Exercise Biomechanics & Form Execution** (Squat, Bench, Deadlift, OHP, etc.)\n• **Workout Programming & Splits** (PPL, Upper-Lower, Progressive Overload)\n• **Athletic Nutrition & Fueling** (Pre & Post-workout meals, Protein math, Creatine)\n• **Recovery & Injury Prevention** (Deload weeks, DOMS, Joint health)\n• **REPX Voice Logging** (How to log sets via voice without touching your phone)\n\nType your doubt below, tap one of the preset topics on the left, or use the 🎙️ **Microphone** to speak naturally!`,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechVoiceEnabled, setSpeechVoiceEnabled] = useState(true);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem('repx_ai_coach_messages', JSON.stringify(messages.slice(-40)));
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

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
        console.error('Voice input error:', err);
      }
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (currentlySpeaking) {
      setCurrentlySpeaking(false);
      return;
    }

    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/•/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setCurrentlySpeaking(false);
    utterance.onerror = () => setCurrentlySpeaking(false);

    setCurrentlySpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customPrompt) => {
    const query = (customPrompt || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
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
          message: query,
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
      console.error('AI Coach query error:', err);
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
    if (window.confirm('Are you sure you want to clear your AI Coach conversation history?')) {
      const reset = [
        {
          id: 'welcome-page-reset',
          sender: 'coach',
          text: `Chat cleared! What doubt can I solve for you now, ${user?.name || 'Athlete'}?`,
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(reset);
      localStorage.setItem('repx_ai_coach_messages', JSON.stringify(reset));
      window.speechSynthesis?.cancel();
      setCurrentlySpeaking(false);
    }
  };

  const handleExportNotes = () => {
    const content = messages
      .map(
        (m) =>
          `[${new Date(m.timestamp).toLocaleString()}] ${
            m.sender === 'user' ? 'ATHLETE' : 'REPX AI COACH'
          }:\n${m.text}\n\n`
      )
      .join('---\n\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `REPX_Coaching_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Preset Doubt Categories
  const doubtTopics = [
    {
      category: 'biomechanics',
      title: 'Biomechanics & Form',
      icon: Dumbbell,
      color: 'text-amber-400',
      questions: [
        'How to bench press with proper bar path & leg drive?',
        'How deep should I squat for maximum quad hypertrophy?',
        'Conventional vs Sumo Deadlift: which is right for my levers?',
        'How to prevent shoulder impingement on overhead press?',
        'Barbell rows: 45 degree vs Pendlay row biomechanics?'
      ]
    },
    {
      category: 'nutrition',
      title: 'Nutrition & Fueling',
      icon: Apple,
      color: 'text-emerald-400',
      questions: [
        'What should I eat 60 mins before a heavy workout?',
        'Post-workout meal: is the anabolic window real?',
        'How to calculate exact daily protein for lean muscle gain?',
        'Creatine Monohydrate: loading phase or 5g daily?',
        'How to maintain muscle mass in a caloric deficit?'
      ]
    },
    {
      category: 'programming',
      title: 'Programming & Overload',
      icon: TrendingUp,
      color: 'text-repx-volt',
      questions: [
        'How do I apply progressive overload without getting injured?',
        'Push Pull Legs (PPL) vs Upper Lower: which split is best for 4 days?',
        'What is RPE and RIR in strength training?',
        'When and how should I take a deload week?',
        'How long should I rest between heavy compound sets?'
      ]
    },
    {
      category: 'voice',
      title: 'Voice Assistant Guide',
      icon: VoiceIcon,
      color: 'text-cyan-400',
      questions: [
        'How do I use voice logging to record sets during a workout?',
        'What voice commands can I speak to navigate REPX?',
        'Can I log reps and weight in kilograms using my voice?'
      ]
    },
    {
      category: 'recovery',
      title: 'Recovery & Health',
      icon: ShieldAlert,
      color: 'text-rose-400',
      questions: [
        'How do I recover faster from intense leg day DOMS?',
        'What are the best warmups to protect my rotator cuff?',
        'How does 7-8 hours of sleep impact testosterone and muscle growth?'
      ]
    }
  ];

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

  const renderFormattedText = (raw) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-repx-volt font-black text-base mt-3 mb-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={idx} className="font-extrabold text-white text-sm mt-2.5 mb-1">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const content = line.trim().replace(/^[-•]\s*/, '');
        return (
          <div key={idx} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2 ml-2 my-1">
            <span className="text-repx-volt font-bold text-base leading-none">•</span>
            <span>{parseInlineBold(content)}</span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2 ml-2 my-1">
            <span className="text-repx-volt font-bold">{line.trim().match(/^\d+\./)[0]}</span>
            <span>{parseInlineBold(line.trim().replace(/^\d+\.\s*/, ''))}</span>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed my-1">
          {parseInlineBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-repx-900 via-repx-850 to-repx-900 border border-repx-border p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-repx-volt/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-repx-volt/20 border border-repx-volt/80 flex items-center justify-center text-repx-volt shadow-volt-glow">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-display tracking-tight text-white">
                  REPX AI COACH & DOUBT ASSISTANT
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-repx-volt text-black">
                  LIVE 2.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Your 24/7 sports science expert for biomechanics, workout programming, nutrition, and voice logging.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => {
                setSpeechVoiceEnabled(!speechVoiceEnabled);
                if (currentlySpeaking) {
                  window.speechSynthesis?.cancel();
                  setCurrentlySpeaking(false);
                }
              }}
              title={speechVoiceEnabled ? 'Voice feedback on' : 'Voice feedback muted'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                speechVoiceEnabled
                  ? 'bg-repx-volt/15 border-repx-volt text-repx-volt'
                  : 'bg-repx-850 border-repx-border text-slate-400'
              }`}
            >
              {speechVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{speechVoiceEnabled ? 'Voice Output ON' : 'Muted'}</span>
            </button>

            <button
              onClick={handleExportNotes}
              title="Download Coaching Notes"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-repx-850 hover:bg-repx-800 text-slate-300 hover:text-white border border-repx-border transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Notes</span>
            </button>

            <button
              onClick={handleClearHistory}
              title="Clear Conversation"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-repx-850 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-repx-border transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Athlete Context Pill Bar */}
        <div className="mt-4 pt-4 border-t border-repx-border/60 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-repx-950 px-3 py-1 rounded-lg border border-repx-borderLight">
            <User className="w-3.5 h-3.5 text-repx-volt" />
            <span className="text-slate-400">Athlete:</span>
            <span className="font-bold text-white">{user?.name || 'Athlete'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-repx-950 px-3 py-1 rounded-lg border border-repx-borderLight">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Goal:</span>
            <span className="font-bold text-white">{user?.fitnessGoal || 'Strength & Hypertrophy'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-repx-950 px-3 py-1 rounded-lg border border-repx-borderLight">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Level:</span>
            <span className="font-bold text-white">{user?.experienceLevel || 'Intermediate'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-repx-950 px-3 py-1 rounded-lg border border-repx-borderLight">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="font-bold text-white">{user?.streak ?? 0} days</span>
          </div>

          <div className="ml-auto hidden xl:flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Dynamic Sports Science Context Active
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Doubt Topics Accordion */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-repx-900 border border-repx-border rounded-2xl p-4 shadow-lg">
            <h3 className="text-sm font-extrabold font-display uppercase tracking-wider text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-repx-volt" />
              Frequently Asked Doubts
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tap any doubt below to have Coach explain the biomechanics and execution instantly:
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setActiveCategory('all')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-repx-volt text-black shadow-volt-glow'
                    : 'bg-repx-850 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {doubtTopics.map((dt) => (
                <button
                  key={dt.category}
                  onClick={() => setActiveCategory(dt.category)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeCategory === dt.category
                      ? 'bg-repx-volt text-black shadow-volt-glow'
                      : 'bg-repx-850 text-slate-400 hover:text-white'
                  }`}
                >
                  {dt.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Questions List */}
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-repx-borderLight">
              {doubtTopics
                .filter((dt) => activeCategory === 'all' || activeCategory === dt.category)
                .map((topicGroup, idx) => {
                  const Icon = topicGroup.icon;
                  return (
                    <div key={idx} className="bg-repx-950/80 rounded-xl p-3 border border-repx-borderLight">
                      <div className="flex items-center gap-2 font-bold text-xs text-white mb-2 pb-1.5 border-b border-repx-border">
                        <Icon className={`w-3.5 h-3.5 ${topicGroup.color}`} />
                        <span>{topicGroup.title}</span>
                      </div>
                      <div className="space-y-1.5">
                        {topicGroup.questions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSendMessage(q)}
                            className="w-full text-left text-xs p-2 rounded-lg bg-repx-900/60 hover:bg-repx-850 hover:text-repx-volt text-slate-300 border border-transparent hover:border-repx-volt/30 transition-all flex items-start gap-2 group"
                          >
                            <span className="text-repx-volt font-bold text-sm leading-none mt-0.5 group-hover:translate-x-0.5 transition-transform">
                              ›
                            </span>
                            <span className="line-clamp-2">{q}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Voice Command Reference Box */}
          <div className="bg-gradient-to-br from-cyan-950/40 via-repx-900 to-repx-900 border border-cyan-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-2">
              <VoiceIcon className="w-4 h-4" />
              <span>VOICE LOGGING CHEATSHEET</span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              During a workout session, click the mic or say:
            </p>
            <div className="space-y-1 text-[11px] text-cyan-200/90 font-mono bg-repx-950 p-2.5 rounded-lg border border-cyan-500/20">
              <div>• "Bench press 4 sets 10 reps 80 kg"</div>
              <div>• "Squats 3 sets 8 reps 120 kg"</div>
              <div>• "Next exercise"</div>
              <div>• "Start rest timer"</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat Canvas */}
        <div className="lg:col-span-8 flex flex-col h-[740px] bg-repx-900 border border-repx-border rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Canvas Header */}
          <div className="p-4 bg-repx-850 border-b border-repx-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-repx-volt/15 border border-repx-volt/50 flex items-center justify-center text-repx-volt shadow-volt-glow">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-repx-900 rounded-full animate-ping" />
              </div>
              <div>
                <div className="text-sm font-black font-display text-white flex items-center gap-2">
                  AI COACH CONSOLE
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold uppercase tracking-wider">
                    ONLINE
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Ask freely in plain English or use voice speech
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 hidden sm:block">
              {messages.length} messages in current thread
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-repx-borderLight">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-repx-volt/20 to-repx-volt/10 border border-repx-volt/40 text-white rounded-br-none shadow-md'
                        : 'bg-repx-950 border border-repx-borderLight text-slate-100 rounded-bl-none shadow-xl'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                        <div className="flex items-center gap-2 text-xs font-black text-repx-volt uppercase tracking-wider font-display">
                          <Bot className="w-4 h-4" /> REPX COACH
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Copy response"
                            className="p-1 hover:text-white text-slate-400 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => speakText(msg.text)}
                            title="Read aloud"
                            className="p-1 hover:text-repx-volt text-slate-400 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div>{isUser ? msg.text : renderFormattedText(msg.text)}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-repx-950 border border-repx-border flex items-center justify-center text-repx-volt shadow-volt-glow">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="bg-repx-950 border border-repx-borderLight rounded-2xl rounded-bl-none p-4 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-repx-volt animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 rounded-full bg-repx-volt animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 rounded-full bg-repx-volt animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-slate-300 ml-2 font-medium">Coach is calculating biomechanics and sports science principles...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening notification */}
          {isListening && (
            <div className="px-4 py-2 bg-rose-500/15 border-t border-rose-500/40 flex items-center justify-between text-rose-400 text-xs shrink-0 animate-pulse">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 animate-bounce text-rose-500" />
                <span className="font-bold">Listening to your question... Speak your doubt now!</span>
              </div>
              <button
                onClick={toggleVoiceInput}
                className="text-[11px] bg-rose-500 text-white font-black px-3 py-1 rounded-lg uppercase tracking-wider"
              >
                Stop Listening
              </button>
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <div className="p-4 bg-repx-850 border-t border-repx-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              {/* Mic Input Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? 'Stop listening' : 'Ask doubt by voice'}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-rose-500/50'
                    : 'bg-repx-900 hover:bg-repx-950 text-slate-300 hover:text-white border-repx-borderLight'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask any gym, form, nutrition, or workout programming doubt..."
                className="flex-1 bg-repx-950 border border-repx-borderLight focus:border-repx-volt text-white text-sm px-4 py-3 rounded-xl outline-none transition-all placeholder:text-slate-400"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="px-5 py-3 rounded-xl bg-repx-volt text-black hover:bg-repx-voltHover disabled:opacity-40 disabled:hover:bg-repx-volt transition-all shadow-volt-glow font-black text-sm flex items-center gap-2 shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask Coach</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>⚡ REPX Sports Science Engine • Instant Answers for All Gym Doubts</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <VoiceIcon className="w-3.5 h-3.5 text-repx-volt" /> Voice-to-Text Supported
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoachPage;
