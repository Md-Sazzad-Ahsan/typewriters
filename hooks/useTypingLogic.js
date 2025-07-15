import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateWPM, calculateAccuracy } from '@/utils/helpers';

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

export default function useTypingLogic() {
  const [state, setState] = useState(initialTypingState);
  const intervalRef = useRef(null);

  const randomLetter = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  return letters[Math.floor(Math.random() * letters.length)];
};

const startsWith = Math.random() < 0.5 ? randomLetter() : undefined; // 50% chance to use a random letter


  const fetchWordsFromAPI = async () => {
    try {
      const res = await fetch('/api/words/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regex: '^[aeiou]\\w{4,8}$',
          minLength: 4,
          maxLength: 8,
          startsWith,
          count: 200,
          random: true
        })
      });

      const data = await res.json();
if (!data.words || !Array.isArray(data.words) || data.words.length === 0) {
  console.warn('No matching words returned:', data);
  return 'loading error'; // or any fallback text
}


      return data.words.join(' ');
    } catch (error) {
      console.error('Failed to fetch words:', error);
      return '';
    }
  };

  const initTest = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const newText = await fetchWordsFromAPI();

    setState({
      ...initialTypingState,
      text: newText,
    });
  }, []);

  const resetTest = useCallback(() => {
    initTest();
  }, [initTest]);

  const handleKeyDown = useCallback((e) => {
    if (state.endTime) return;

    if (e.key === ' ' && e.target === document.body) e.preventDefault();

    if (!state.isTyping && e.key.length === 1 && e.key !== ' ') {
      setState(prev => ({
        ...prev,
        isTyping: true,
        startTime: new Date(),
      }));
    }

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

    if (e.key.length === 1) {
      const expectedChar = state.text[state.currentCharIndex];
      const isCorrect = e.key === expectedChar;

      setState(prev => {
        const newErrors = { ...prev.errors };
        if (!isCorrect) {
          newErrors[prev.currentCharIndex] = true;
        }

        const newTypedText = prev.typedText + e.key;
        const newCurrentCharIndex = prev.currentCharIndex + 1;
        const newCorrectCharCount = prev.correctCharCount + (isCorrect ? 1 : 0);

        const newState = {
          ...prev,
          typedText: newTypedText,
          currentCharIndex: newCurrentCharIndex,
          errors: newErrors,
          correctCharCount: newCorrectCharCount,
        };

        if (newCurrentCharIndex === state.text.length) {
          newState.endTime = new Date();
          newState.isTyping = false;
          if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return newState;
      });
    }
  }, [state]);

  const wpm = state.startTime && state.endTime
    ? calculateWPM(state.correctCharCount, state.startTime, state.endTime)
    : 0;

  const accuracy = state.currentCharIndex > 0
    ? calculateAccuracy(state.correctCharCount, state.currentCharIndex)
    : 0;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    ...state,
    wpm,
    accuracy,
    resetTest,
    handleKeyDown,
    initTest,
  };
}
