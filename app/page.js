'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import ModeOptions from '@/components/ModeOptions';
import TypingArea from '@/components/TypingArea';
import StatsDisplay from '@/components/StatsDisplay';
import CommandBox from '@/components/CommandBox';
import Footer from '@/components/Footer';
import Result from '@/components/Result';
import useTypingLogic from '@/hooks/useTypingLogic';

export default function HomePage() {
  const {
    text,
    typedText,
    currentCharIndex,
    errors,
    startTime,
    endTime,
    isTyping,
    wpm,
    accuracy,
    resetTest,
    handleKeyDown,
    initTest,
  } = useTypingLogic();

  const [isCommandBoxOpen, setIsCommandBoxOpen] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCommandBoxOpen(prev => !prev);
      } else if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsCommandBoxOpen(prev => !prev);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    initTest();
  }, [initTest]);

  useEffect(() => {
    if (endTime) {
      setIsTypingDone(true);
    }
  }, [endTime]);

  const handleRestart = () => {
    resetTest();
    setIsTypingDone(false);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-7xl mx-auto">
      <Header />
      <ModeOptions />

      <main className="flex-grow flex flex-col items-center justify-center space-y-8">
        {!isTyping && !isTypingDone && (
          <StatsDisplay
            wpm={wpm}
            accuracy={accuracy}
            time={startTime && endTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0}
          />
        )}

        {!isTypingDone ? (
          <div
            className="relative w-full p-6 rounded-lg shadow-lg cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <TypingArea
              text={text}
              typedText={typedText}
              currentCharIndex={currentCharIndex}
              errors={errors}
            />
            <input
              ref={inputRef}
              type="text"
              className="absolute inset-0 opacity-0 z-10 w-full h-64 overflow-hidden cursor-text"
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => {
                  if (document.activeElement !== inputRef.current && !isCommandBoxOpen) {
                    inputRef.current?.focus();
                  }
                }, 0);
              }}
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        ) : (
          <Result
            wpm={wpm}
            accuracy={accuracy}
            mode="Normal,EN"
            raw={wpm + 10}
            characters="123 | 45 | 6 | 7"
            weakWords="132"
            onRestart={handleRestart}
          />
        )}

        {!isTyping && isTypingDone && (
          <div className="text-center text-gray-400 mt-4 space-y-2">
            <p><span className="font-bold text-blue-400">Tab</span> - restart test</p>
            <p><span className="font-bold text-blue-400">Esc</span> or <span className="font-bold text-blue-400">Ctrl + Shift + P</span> - Open Command box</p>
          </div>
        )}
      </main>

      {isCommandBoxOpen && (
        <CommandBox onClose={() => setIsCommandBoxOpen(false)} />
      )}

      <Footer />
    </div>
  );
}
