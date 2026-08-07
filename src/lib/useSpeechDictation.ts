"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Minimal shape of the non-standard Web Speech API — not in lib.dom.d.ts.
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// Static for the life of the page — no subscription needed, just distinct
// server vs. client snapshots so `useSyncExternalStore` avoids a hydration
// mismatch (the server has no `window` and must render the unsupported state).
function subscribeNever() {
  return () => {};
}
function getSupportSnapshot(): boolean {
  return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}
function getServerSupportSnapshot(): boolean {
  return false;
}

/**
 * Wraps the browser's Web Speech API for voice dictation into a text field.
 * Supported in Chrome/Edge; Safari is partial and Firefox has no support —
 * `isSupported` lets callers hide the mic affordance rather than show a
 * button that silently does nothing.
 */
export function useSpeechDictation(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const isSupported = useSyncExternalStore(
    subscribeNever,
    getSupportSnapshot,
    getServerSupportSnapshot,
  );
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  function start() {
    const SpeechRecognitionImpl =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript.trim()) {
        onTranscriptRef.current(transcript.trim());
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  return {
    isSupported,
    isListening,
    toggle: () => (isListening ? stop() : start()),
  };
}
