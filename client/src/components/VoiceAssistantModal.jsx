import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Dumbbell,
  Compass,
  CornerDownRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { parseVoiceCommand } from '../utils/voiceParser';

export const VoiceAssistantModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { activeSession, hasActiveWorkout, startWorkout, addSet, updateSet, exercises: workoutList } = useWorkout();
  const navigate = useNavigate();

  // Voice States: 'idle' | 'listening' | 'processing' | 'success' | 'error'
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [parsedAction, setParsedAction] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceState('listening');
      setFeedback('Listening... Speak a gym navigation or workout logging command.');
      setParsedAction(null);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      setVoiceState('processing');
      setFeedback(`Recognized: "${spokenText}"`);

      setTimeout(() => {
        handleProcessCommand(spokenText);
      }, 350);
    };

    recognition.onerror = (event) => {
      console.warn('SpeechRecognition error:', event.error);
      setVoiceState('error');
      setFeedback(
        event.error === 'not-allowed'
          ? 'Microphone access denied. Please allow microphone permissions in your browser.'
          : 'Could not capture speech. Please try again or tap a suggestion below.'
      );
    };

    recognition.onend = () => {
      if (voiceState === 'listening') {
        setVoiceState('idle');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Reset or start whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setVoiceState('idle');
      setTranscript('');
      setFeedback('Tap the microphone button and speak naturally.');
      setParsedAction(null);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    }
  }, [isOpen]);

  const startListening = () => {
    setFeedback('');
    setTranscript('');
    setParsedAction(null);

    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.abort();
        recognitionRef.current.start();
      }
    } else if (!isSupported) {
      setFeedback('Speech recognition is not supported in this browser. You can type or click the demo commands below.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
  };

  const handleProcessCommand = (commandText) => {
    const action = parseVoiceCommand(commandText);
    setParsedAction(action);

    if (!action) {
      setVoiceState('error');
      setFeedback(`Unknown command: "${commandText}". Try saying "Show my workouts" or "Bench press 4 sets 10 reps 80 kg".`);
      return;
    }

    setVoiceState('success');

    if (action.type === 'NAVIGATE' || action.type === 'NAVIGATE_WORKOUT') {
      setFeedback(`✓ ${action.description}`);
      setTimeout(() => {
        onClose();
        navigate(action.path);
      }, 900);
    } else if (action.type === 'START_WORKOUT') {
      setFeedback('✓ Starting workout session...');
      setTimeout(() => {
        onClose();
        if (!hasActiveWorkout && workoutList && workoutList.length > 0) {
          startWorkout(workoutList[0]);
        }
        navigate('/workout/session');
      }, 900);
    } else if (action.type === 'LOGOUT') {
      setFeedback('✓ Logging out of REPX...');
      setTimeout(() => {
        onClose();
        logout();
        navigate('/login');
      }, 900);
    } else if (action.type === 'WORKOUT_LOG') {
      setFeedback(`✓ Parsed Set Log: ${action.formattedSummary}`);

      // If active session is open, populate the set!
      if (hasActiveWorkout && activeSession) {
        try {
          const currentExIdx = 0; // Target first or active exercise
          if (activeSession.exercises && activeSession.exercises.length > 0) {
            // Update current set or add a new set
            const targetSetIdx = activeSession.exercises[currentExIdx].sets.length - 1;
            if (targetSetIdx >= 0) {
              updateSet(currentExIdx, targetSetIdx, 'weightKg', action.weightKg);
              updateSet(currentExIdx, targetSetIdx, 'reps', action.reps);
            }
          }
        } catch (e) {
          console.warn('Could not auto-insert into active session:', e);
        }
      }

      setTimeout(() => {
        if (hasActiveWorkout) {
          onClose();
          navigate('/workout/session');
        }
      }, 1400);
    }
  };

  const handleQuickCommand = (text) => {
    setTranscript(text);
    setVoiceState('processing');
    setFeedback(`Processing demo command: "${text}"`);
    setTimeout(() => {
      handleProcessCommand(text);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-repx-900 border border-repx-border shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-repx-volt/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-repx-border mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-repx-volt/15 border border-repx-volt/40 flex items-center justify-center text-repx-volt shadow-volt-glow">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-display text-white tracking-tight flex items-center gap-2">
                REPX Voice Assistant
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-repx-volt/20 text-repx-volt border border-repx-volt/30">
                  Live Telemetry
                </span>
              </h3>
              <p className="text-xs text-slate-400">Speak commands naturally to navigate or log workout sets.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-repx-800 hover:bg-repx-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Central Voice Control */}
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="relative mb-5">
            {/* Pulse rings when listening */}
            {voiceState === 'listening' && (
              <>
                <div className="absolute -inset-4 rounded-full bg-repx-volt/20 animate-ping opacity-75" />
                <div className="absolute -inset-2 rounded-full bg-repx-volt/30 animate-pulse" />
              </>
            )}

            <button
              onClick={voiceState === 'listening' ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
                voiceState === 'listening'
                  ? 'bg-repx-crimson text-white shadow-crimson-glow scale-105'
                  : 'bg-repx-volt text-black shadow-volt-glow hover:bg-repx-voltHover'
              }`}
            >
              {voiceState === 'listening' ? (
                <MicOff className="w-8 h-8 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="font-display font-extrabold text-sm mb-1 text-white">
            {voiceState === 'listening' && 'Listening to your voice...'}
            {voiceState === 'processing' && 'Interpreting voice command...'}
            {voiceState === 'success' && 'Command Recognized & Executing'}
            {voiceState === 'error' && 'Recognition Attention'}
            {voiceState === 'idle' && 'Click microphone to speak'}
          </div>

          {/* Transcript / Feedback Bubble */}
          <div className="min-h-[52px] w-full max-w-md mt-2 px-4 py-2.5 rounded-xl bg-repx-950 border border-repx-border flex items-center justify-center text-center">
            {transcript ? (
              <span className="text-xs text-white font-medium">
                "{transcript}"
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                {feedback}
              </span>
            )}
          </div>

          {/* Parsed Action Card */}
          {parsedAction && (
            <div className="mt-4 w-full p-3 rounded-xl bg-repx-850 border border-repx-volt/40 flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-2 text-slate-200">
                {parsedAction.type === 'WORKOUT_LOG' ? (
                  <Dumbbell className="w-4 h-4 text-repx-volt shrink-0" />
                ) : (
                  <Compass className="w-4 h-4 text-repx-cyan shrink-0" />
                )}
                <span className="font-bold text-white">
                  {parsedAction.formattedSummary || parsedAction.description}
                </span>
              </div>
              <span className="text-[10px] font-black text-repx-volt uppercase px-2 py-0.5 rounded bg-repx-volt/15">
                Ready
              </span>
            </div>
          )}
        </div>

        {/* Quick Voice Commands Suggestions */}
        <div className="pt-4 border-t border-repx-border">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-repx-volt" /> Quick Voice Command Examples
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Open AI Coach',
              'Show my workouts',
              'Show exercises',
              'Open push workout',
              'Start workout',
              'Show my dashboard',
              'Bench press 4 sets 10 reps 80 kg',
              '3 sets 12 reps 20 kg bicep curls',
              'Show my profile',
              'Change password'
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleQuickCommand(cmd)}
                className="px-2.5 py-1 rounded-lg bg-repx-800 hover:bg-repx-750 border border-repx-border text-[11px] font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
              >
                <CornerDownRight className="w-3 h-3 text-repx-volt" />
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantModal;
