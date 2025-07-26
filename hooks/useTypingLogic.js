import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateWPM, calculateAccuracy } from '@/utils/helpers';
import { generateWords } from '@/utils/words';

const initialTypingState = {
  text: '',
  typedText: '',
  currentCharIndex: 0,
  errors: {},
  startTime: null,
  endTime: null,
  isTyping: false,
  correctCharCount: 0,
};

export default function useTypingLogic({ mode, code, lang, time }) {
  const [state, setState] = useState(initialTypingState);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  const generateTypingText = useCallback(() => {
    try {
      return generateWords({
        mode,
        code,
        lang,
        count: 200,
        random: true
      });
    } catch (error) {
      console.error('Error generating words:', error);
      return 'The quick brown fox jumps over the lazy dog. A journey of a thousand miles begins with a single step.';
    }
  }, [mode, code, lang]);

  const initTest = useCallback(() => {
    try {
      const text = generateTypingText();
      setState(prev => ({ ...prev, text, isTyping: true, startTime: new Date() }));
    } catch (error) {
      console.error('Error initializing test:', error);
      setState(prev => ({ ...prev, text: 'An error occurred while loading the text.' }));
    }
  }, [generateTypingText]);

  const resetTest = useCallback(() => {
    setState(initialTypingState);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (state.endTime) return;

    if (e.key === ' ' && e.target === document.body) e.preventDefault();

    // Start typing on first character key press
    if (!state.isTyping && e.key.length === 1 && e.key !== ' ') {
      setState(prev => ({
        ...prev,
        isTyping: true,
        startTime: new Date(),
      }));
    }

    // Handle backspace
    if (e.key === 'Backspace') {
      setState(prev => {
        const newTypedText = prev.typedText.slice(0, -1);
        const newErrors = { ...prev.errors };
        const charDeletedIndex = prev.currentCharIndex - 1;
        let newCorrectCharCount = prev.correctCharCount;

        if (charDeletedIndex >= 0 && !prev.errors[charDeletedIndex]) {
          newCorrectCharCount = Math.max(0, newCorrectCharCount - 1);
        }

        delete newErrors[charDeletedIndex];

        return {
          ...prev,
          typedText: newTypedText,
          currentCharIndex: Math.max(0, prev.currentCharIndex - 1),
          errors: newErrors,
          correctCharCount: newCorrectCharCount,
        };
      });
      return;
    }

    // Handle space and character keys
    if (e.key === ' ' || e.key.length === 1) {
      const text = state.text;
      const typedText = state.typedText;
      const currentCharIndex = state.currentCharIndex;

      const newTypedText = typedText + e.key;
      const newCharIndex = currentCharIndex + 1;
      const expectedChar = text[currentCharIndex];
      const isCorrect = e.key === expectedChar;
      const newCorrectCharCount = isCorrect ? currentCharIndex + 1 : state.correctCharCount;

      setState(prev => {
        const newErrors = { ...prev.errors };
        if (!isCorrect) {
          newErrors[currentCharIndex] = true;
        }

        const newState = {
          ...prev,
          typedText: newTypedText,
          currentCharIndex: newCharIndex,
          errors: newErrors,
          correctCharCount: newCorrectCharCount,
        };

        if (newCharIndex === text.length) {
          newState.endTime = new Date();
          newState.isTyping = false;
          if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return newState;
      });
    }
  }, [state.endTime, state.isTyping, state.text, state.errors, state.currentCharIndex, state.correctCharCount]);

  useEffect(() => {
    if (state.isTyping && time) {
      const minutes = parseInt(time);
      const milliseconds = minutes * 60 * 1000;
      
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          endTime: new Date(),
          isTyping: false,
        }));
        if (intervalRef.current) clearInterval(intervalRef.current);
      }, milliseconds);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.isTyping, time]);

  const wpm = state.startTime && state.endTime
    ? calculateWPM(state.correctCharCount, state.startTime, state.endTime)
    : 0;

  const accuracy = state.currentCharIndex > 0
    ? calculateAccuracy(state.correctCharCount, state.currentCharIndex)
    : 0;

  useEffect(() => {
    if (state.isTyping && time) {
      const minutes = parseInt(time);
      const milliseconds = minutes * 60 * 1000;
      
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          endTime: new Date(),
          isTyping: false,
        }));
        if (intervalRef.current) clearInterval(intervalRef.current);
      }, milliseconds);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.isTyping, time]);

  return {
    ...state,
    wpm,
    accuracy,
    resetTest,
    handleKeyDown,
    initTest,
  };
}
