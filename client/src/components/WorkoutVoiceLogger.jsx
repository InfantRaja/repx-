import React, { useState, useEffect, useRef } from 'react';
import { fitnessAPI } from '../services/api';
import { parseWorkoutLog } from '../utils/voiceParser';

const WorkoutVoiceLogger = ({ onRecordAdded, defaultExercise = '' }) => {
  // UI States: 'idle' | 'listening' | 'processing' | 'success' | 'error'
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [pendingLog, setPendingLog] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  const recognitionRef = useRef(null);

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
      setErrorMessage('');
      setSaveSuccessMessage('');
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      setVoiceState('processing');

      setTimeout(() => {
        const parsed = parseWorkoutLog(speechResult);
        if (parsed) {
          setPendingLog(parsed);
          setVoiceState('success');
        } else {
          setVoiceState('error');
          setErrorMessage('Could not understand fitness log. Say for example: "Bench press 70 kilos 5 reps"');
        }
      }, 500);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setVoiceState('error');
      setErrorMessage(
        event.error === 'not-allowed'
          ? 'Microphone permission denied. Please allow microphone access.'
          : 'Could not capture voice audio. Please try again.'
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

  const startListening = () => {
    setErrorMessage('');
    setSaveSuccessMessage('');
    setPendingLog(null);
    setTranscript('');

    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition already started or error:', err);
        recognitionRef.current.abort();
        recognitionRef.current.start();
      }
    } else {
      // Fallback for simulation or unsupported browsers
      setVoiceState('listening');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
  };

  // Test simulation for demonstration in environments without microphone hardware
  const simulateVoiceInput = (sampleSentence) => {
    setTranscript(sampleSentence);
    setVoiceState('processing');
    setErrorMessage('');
    setSaveSuccessMessage('');

    setTimeout(() => {
      const parsed = parseWorkoutLog(sampleSentence);
      if (parsed) {
        setPendingLog(parsed);
        setVoiceState('success');
      } else {
        setVoiceState('error');
        setErrorMessage('Could not understand. Try again.');
      }
    }, 400);
  };

  // Confirm and Save to MongoDB
  const handleConfirmSave = async () => {
    if (!pendingLog) return;
    setSaving(true);
    try {
      const res = await fitnessAPI.create({
        exercise: pendingLog.exercise,
        weight: pendingLog.weight,
        sets: pendingLog.sets || 1,
        reps: pendingLog.reps,
        date: new Date()
      });

      if (res.data.success) {
        setSaveSuccessMessage(`Saved: ${pendingLog.exercise} (${pendingLog.weight} kg × ${pendingLog.reps} reps)`);
        setPendingLog(null);
        setVoiceState('idle');
        if (onRecordAdded) onRecordAdded(res.data.record);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save workout set to database.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPendingLog(null);
    setVoiceState('idle');
    setTranscript('');
    setErrorMessage('');
  };

  return (
    <div className="card card-custom p-4 mb-4 border-0 shadow-sm bg-white">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="stat-icon bg-danger bg-opacity-10 text-danger rounded-circle p-2">
            <i className="bi bi-mic-fill fs-5"></i>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Voice Workout Logging</h5>
            <small className="text-muted">Speak your set details naturally while exercising</small>
          </div>
        </div>

        {/* State Badge */}
        <div>
          {voiceState === 'idle' && (
            <span className="badge bg-light text-secondary border px-3 py-2">
              🎙️ Tap to speak
            </span>
          )}
          {voiceState === 'listening' && (
            <span className="badge bg-danger text-white px-3 py-2 pulse-badge">
              🔴 Listening...
            </span>
          )}
          {voiceState === 'processing' && (
            <span className="badge bg-warning text-dark px-3 py-2">
              ⏳ Processing...
            </span>
          )}
          {voiceState === 'success' && (
            <span className="badge bg-success text-white px-3 py-2">
              ✓ Command recognized
            </span>
          )}
          {voiceState === 'error' && (
            <span className="badge bg-danger text-white px-3 py-2">
              ⚠️ Could not understand. Try again.
            </span>
          )}
        </div>
      </div>

      {/* Main Microphone Button */}
      <div className="text-center py-3">
        <button
          type="button"
          onClick={voiceState === 'listening' ? stopListening : startListening}
          className={`btn voice-mic-btn rounded-circle shadow-lg p-0 d-inline-flex align-items-center justify-content-center ${
            voiceState === 'listening'
              ? 'btn-danger voice-mic-active'
              : 'btn-outline-danger'
          }`}
          style={{ width: '84px', height: '84px', fontSize: '2.2rem' }}
          title={voiceState === 'listening' ? 'Stop listening' : 'Start speaking set details'}
        >
          <i
            className={`bi ${
              voiceState === 'listening' ? 'bi-mic-fill' : 'bi-mic'
            }`}
          ></i>
        </button>

        <div className="mt-3">
          <strong className="d-block text-dark">
            {voiceState === 'listening'
              ? 'Listening to your voice...'
              : voiceState === 'processing'
              ? 'Analyzing spoken workout metrics...'
              : 'Tap microphone and speak your set'}
          </strong>
          <small className="text-muted">
            Example: "Bench press 70 kilos 5 reps" or "Squat 100 kilos 5 reps"
          </small>
        </div>

        {transcript && (
          <div className="mt-2 p-2 bg-light rounded text-muted small d-inline-block border">
            <i className="bi bi-chat-left-quote me-1"></i> Heard: "<strong>{transcript}</strong>"
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert-warning alert-dismissible fade show small mt-3 mb-0" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccessMessage && (
        <div className="alert alert-success alert-dismissible fade show small mt-3 mb-0" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {saveSuccessMessage}
          <button type="button" className="btn-close" onClick={() => setSaveSuccessMessage('')}></button>
        </div>
      )}

      {/* CONFIRMATION CARD (Required: Show confirmation before saving to MongoDB) */}
      {pendingLog && (
        <div className="card border-success mt-3 p-3 bg-success bg-opacity-10 fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-success">CONFIRM WORKOUT SET</span>
            <small className="text-muted">Requires confirmation before saving</small>
          </div>
          <h4 className="fw-bolder text-dark mb-1">
            {pendingLog.exercise} — {pendingLog.weight} kg × {pendingLog.reps} reps
          </h4>
          <p className="text-muted small mb-3">
            Exercise: <strong>{pendingLog.exercise}</strong> | Weight: <strong>{pendingLog.weight} kg</strong> | Reps: <strong>{pendingLog.reps}</strong>
          </p>
          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={saving}
              className="btn btn-success fw-bold px-4"
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving to MongoDB...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1"></i> CONFIRM
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="btn btn-outline-secondary px-4"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Quick Demo Simulator Buttons (Allows testing voice sentences with 1 click) */}
      <div className="mt-3 pt-3 border-top">
        <small className="text-muted d-block fw-semibold mb-2">
          <i className="bi bi-lightning-charge text-danger me-1"></i> Quick Test Spoken Commands (Click to simulate speaking):
        </small>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => simulateVoiceInput('Bench press 70 kilos 5 reps')}
            className="btn btn-sm btn-outline-secondary"
          >
            "Bench press 70 kilos 5 reps"
          </button>
          <button
            type="button"
            onClick={() => simulateVoiceInput('Squat 100 kilos 5 reps')}
            className="btn btn-sm btn-outline-secondary"
          >
            "Squat 100 kilos 5 reps"
          </button>
          <button
            type="button"
            onClick={() => simulateVoiceInput('Lat pulldown 50 kilos 10 reps')}
            className="btn btn-sm btn-outline-secondary"
          >
            "Lat pulldown 50 kilos 10 reps"
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutVoiceLogger;
