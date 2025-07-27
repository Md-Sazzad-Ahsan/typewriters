"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import { generateRandomWords, getTargetWordCount } from "@/utils/wordGenerator";
import TypingArea from "@/components/TypingArea";
import StatsDisplay from "@/components/StatsDisplay";
import CommandBox from "@/components/CommandBox";
import Footer from "@/components/Footer";
import Result from "@/components/Result";
import ModeSelector from "@/components/ModeSelector";

export default function HomePage() {
  const [text, setText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const testIntervalRef = useRef(null);
  const [typingSettings, setTypingSettings] = useState({
    language: 'English',
    punctuation: true,
    numbers: false,
    codeLanguage: '',
    typingCount: 'Time',
    typingOption: '',
    quoteSize: ''
  });

  const handleModeChange = useCallback((newModes) => {
    console.log('New typing settings:', newModes);
    setTypingSettings(newModes);
  }, []);
  const [wordList, setWordList] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [targetWordCount, setTargetWordCount] = useState(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const [resultDetails, setResultDetails] = useState({
    wpm: 0,
    accuracy: 100,
    time: null,
    words: null,
    mode: 'Normal,English',
    testDuration: 0
  });


  // Reset test and regenerate words when typing settings change
  useEffect(() => {
    const regenerateWords = async () => {
      try {
        const wordCount = getTargetWordCount(typingSettings);
        setTargetWordCount(wordCount);
        
        if (typingSettings.typingCount === 'Time') {
          setTimeLeft(parseInt(typingSettings.typingOption) || 30);
        }
        
        // Force a re-fetch of words
        const newWords = await fetchWords(typingSettings.language, typingSettings.codeLanguage);
        const selectedWords = generateRandomWords(newWords, wordCount, true);
        setText(selectedWords.join(' '));
        
        // Reset test state
        setTypedText('');
        setCurrentCharIndex(0);
        setErrors([]);
        setStartTime(null);
        setEndTime(null);
        setIsTyping(false);
        setIsTypingDone(false);
        setWpm(0);
        setAccuracy(100);
        
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (error) {
        console.error('Error regenerating words:', error);
      }
    };
    
    regenerateWords();
  }, [typingSettings.typingCount, typingSettings.typingOption, typingSettings.language, typingSettings.codeLanguage]);

  // Function to fetch words based on language and code language
  const fetchWords = async (language, codeLanguage = '') => {
    try {
      let wordFilePath = '';
      
      if (language === 'English') {
        wordFilePath = '/words/English/common3k.txt';
      } else if (language === 'Bangla') {
        wordFilePath = '/words/Bangla/ShortWordsList.txt';
      } else if (language === 'Code' && codeLanguage) {
        const codeLanguageMap = {
          'C/C++': '/words/Coding/c_cpp_words.txt',
          'Python': '/words/Coding/python_words.txt',
          'JavaScript': '/words/Coding/javascript_words.txt',
          'Java': '/words/Coding/java_words.txt',
          'Flutter': '/words/Coding/dart_words.txt',
        };
        wordFilePath = codeLanguageMap[codeLanguage] || '/words/English/common3k.txt';
      } else {
        wordFilePath = '/words/English/common3k.txt';
      }

      const response = await fetch(wordFilePath);
      if (!response.ok) {
        throw new Error(`Failed to load words from ${wordFilePath}`);
      }
      
      const text = await response.text();
      return text.split(/\s+/).filter(word => word.trim() !== '');
    } catch (error) {
      console.error('Error loading words:', error);
      // Return a default set of words if loading fails
      return ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
    }
  };

  // Load words based on language and code language
  useEffect(() => {
    const loadWords = async () => {
      try {
        const newWords = await fetchWords(typingSettings.language, typingSettings.codeLanguage);
        setWordList(newWords);
        
        // Generate initial text
        const wordCount = getTargetWordCount(typingSettings);
        const selectedWords = generateRandomWords(newWords, wordCount, true);
        setText(selectedWords.join(' '));
        setTargetWordCount(wordCount);
        
        if (typingSettings.typingCount === 'Time') {
          setTimeLeft(parseInt(typingSettings.typingOption) || 30);
        }
      } catch (error) {
        console.error('Error loading word list:', error);
        // Fallback to default words if there's an error
        const defaultWords = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "I"];
        setWordList(defaultWords);
        const wordCount = getTargetWordCount(typingSettings);
        const selectedWords = generateRandomWords(defaultWords, wordCount, true);
        setText(selectedWords.join(' '));
      }
    };

    loadWords();
  }, [typingSettings.language, typingSettings.codeLanguage, typingSettings.typingCount, typingSettings.typingOption]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update timeLeft when typing option changes in Time mode
  useEffect(() => {
    if (typingSettings.typingCount === 'Time' && !isTyping) {
      const timeLimit = parseInt(typingSettings.typingOption) || 30;
      setTimeLeft(timeLimit);
    }
  }, [typingSettings.typingOption, typingSettings.typingCount, isTyping]);



  // Start or stop timer based on typing state and settings
  useEffect(() => {
    // Clear any existing timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (testIntervalRef.current) clearInterval(testIntervalRef.current);
    
    timerRef.current = null;
    testIntervalRef.current = null;

    // No test data tracking needed
    
    // Only set up a new timer if we're in time mode and typing
    if (isTyping && typingSettings.typingCount === 'Time') {
      const timeLimit = parseInt(typingSettings.typingOption) || 30;
      setTimeLeft(timeLimit);
      
      // Start the countdown
      const startTime = Date.now();
      const endTime = startTime + (timeLimit * 1000);
      
      // Immediate first update
      const updateTimer = () => {
        const now = Date.now();
        const timeRemaining = Math.ceil((endTime - now) / 1000);
        
        if (timeRemaining <= 0) {
          setTimeLeft(0);
          setIsTyping(false);
          setEndTime(new Date());
          setIsTypingDone(true);
          clearInterval(timerRef.current);
          timerRef.current = null;
        } else {
          setTimeLeft(timeRemaining);
        }
      };
      
      // Initial update
      updateTimer();
      
      // Set up interval for updates
      timerRef.current = setInterval(updateTimer, 200);
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
        testIntervalRef.current = null;
      }
    };
  }, [isTyping, typingSettings.typingCount, typingSettings.typingOption]);

  // Track word count for word-based tests
  useEffect(() => {
    if (!isTyping || typingSettings.typingCount !== 'Words' || !targetWordCount) return;
    
    // Word tracking without data collection
    
    // Count words more accurately, handling multiple spaces and newlines
    const currentWordCount = typedText.trim() === '' ? 0 : typedText.trim().split(/\s+/).length;
    
    // Get the actual words from the original text to compare against
    const targetWords = text.split(/\s+/).slice(0, targetWordCount);
    const targetText = targetWords.join(' ');
    
    // Check if we've typed all the target words
    const userWords = typedText.trim().split(/\s+/);
    const hasTypedAllWords = userWords.length >= targetWordCount && 
                           userWords.slice(0, targetWordCount).join(' ') === 
                           targetWords.slice(0, Math.min(targetWordCount, userWords.length)).join(' ');
    
    if (hasTypedAllWords) {
      // Update the displayed text to exactly match the target word count
      setText(targetText);
      
      // Truncate the user's input to match the target word count
      if (userWords.length > targetWordCount) {
        const truncatedText = userWords.slice(0, targetWordCount).join(' ');
        setTypedText(truncatedText);
      }
      
      // End the test
      setIsTyping(false);
      setEndTime(new Date());
      setIsTypingDone(true);
    }
  }, [typedText, isTyping, typingSettings.typingCount, targetWordCount, text]);

  //New Function to track and save typing progress
  const trackTypingProgress = () => {
    const now = new Date();
    const elapsedTimeInSeconds = (now - startTime) / 1000;
    const elapsedTimeInMinutes = elapsedTimeInSeconds / 60;

    const totalChars = typedText.length;
    const totalWords = typedText.trim().split(/\s+/).length;

    const totalErrorChars = errors.filter(Boolean).length;
    const correctChars = totalChars - totalErrorChars;

    const rawWPM = Math.round((totalChars / 5) / Math.max(elapsedTimeInMinutes, 0.01));
    const adjustedWPM = Math.max(0, rawWPM - Math.round(totalErrorChars / Math.max(elapsedTimeInMinutes * 60, 1)));
    const accuracyPercent = totalChars > 0 ? ((correctChars / totalChars) * 100).toFixed(1) : '100.0';

    const newEntry = {
      timestamp: Date.now(),
      mode: typingSettings.typingCount,
      duration: typingSettings.typingOption,
      wpm: adjustedWPM,
      rawWPM: rawWPM,
      accuracy: parseFloat(accuracyPercent),
      errors: totalErrorChars,
      wordsTyped: totalWords,
      charactersTyped: totalChars,
      elapsedTime: elapsedTimeInSeconds.toFixed(2),
    };

    const prevData = JSON.parse(localStorage.getItem('typing_progress')) || [];
    localStorage.setItem('typing_progress', JSON.stringify([...prevData, newEntry]));
  };

  // Track progress for time-based tests
  useEffect(() => {
    if (isTyping && typingSettings.typingCount === 'Time') {
      testIntervalRef.current = setInterval(() => {
        trackTypingProgress();
      }, 1000); // track every second

      return () => clearInterval(testIntervalRef.current);
    }
  }, [isTyping, typedText]);

  // Track progress for word-based tests
  useEffect(() => {
    if (!isTyping || typingSettings.typingCount !== 'Words') return;

    const userWords = typedText.trim().split(/\s+/);
    const currentWordCount = userWords.length;

    // Only track after each complete word
    if (typedText.endsWith(' ') && currentWordCount <= targetWordCount) {
      trackTypingProgress();
    }
  }, [typedText, isTyping]);

  const generateNewText = (wordList) => {
    if (!wordList || wordList.length === 0) {
      console.error('No words available to generate text');
      return;
    }
    
    // Get the target word count based on current settings
    const wordCount = getTargetWordCount(typingSettings);
    
    // Set the target word count for the test
    setTargetWordCount(wordCount);
    
    // Generate the text with the exact number of words requested
    const selectedWords = generateRandomWords(wordList, wordCount, true);
    
    // If we're in time mode, update the time left
    if (typingSettings.typingCount === 'Time') {
      setTimeLeft(parseInt(typingSettings.typingOption) || 30);
    }

    setText(selectedWords.join(' '));
    setTypedText('');
    setCurrentCharIndex(0);
    setErrors([]);
    setStartTime(null);
    setEndTime(null);
    setIsTyping(false);
    setIsTypingDone(false);
  };

  useEffect(() => {
    // Use a predefined set of words
    const words = [
      "the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take",
    ];

    // Select 20 random words from the list
    const selectedWords = [];
    const usedIndices = new Set();

    while (selectedWords.length < 20 && usedIndices.size < words.length) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedWords.push(words[randomIndex]);
      }
    }

    setText(selectedWords.join(" "));
  }, []);

  const [isCommandBoxOpen, setIsCommandBoxOpen] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsCommandBoxOpen((prev) => !prev);
      } else if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setIsCommandBoxOpen((prev) => !prev);
      } else if (e.key === "Tab") {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleKeyDown = (e) => {
    e.preventDefault(); // Prevent default behavior to avoid any unwanted side effects

    if (!isTyping) {
      setStartTime(new Date());
      setIsTyping(true);
    }

    const key = e.key;
    const currentPos = typedText.length;
    const currentChar = text[currentPos];

    if (key === "Backspace") {
      if (e.ctrlKey) {
        // Handle Ctrl+Backspace - delete entire word
        if (currentPos > 0) {
          // Get the text that has been typed so far
          const currentTypedText = typedText;
          
          // Find the start of the current word in the typed text
          let wordStart = currentPos;
          
          // First, find the start of the current word (skip any spaces at current position)
          while (wordStart > 0 && (currentTypedText[wordStart - 1] === ' ' || text[wordStart - 1] === ' ')) {
            wordStart--;
          }
          
          // Now find the start of the actual word (go back to the beginning of the word)
          while (wordStart > 0 && currentTypedText[wordStart - 1] !== ' ' && text[wordStart - 1] !== ' ') {
            wordStart--;
          }
          
          // Update the typed text and errors
          setTypedText((prev) => prev.slice(0, wordStart));
          setErrors((prev) => prev.slice(0, wordStart));
          
          // Update the cursor position
          setCurrentCharIndex(wordStart);
          
          // Update WPM and accuracy if needed
          if (startTime) {
            const timeElapsed = (new Date() - startTime) / 1000 / 60; // in minutes
            const wordsTyped = Math.max(0, wordStart - (wordStart > 0 && text[wordStart - 1] === ' ' ? 1 : 0));
            const newWpm = Math.round(wordsTyped / 5 / Math.max(0.1, timeElapsed));
            setWpm(newWpm);
            
            // Recalculate accuracy
            const newErrors = errors.slice(0, wordStart);
            const correctChars = newErrors.filter(e => !e).length;
            const newAccuracy = Math.round((correctChars / Math.max(1, wordStart)) * 100);
            setAccuracy(newAccuracy);
          }
        }
      } else {
        // Regular backspace - delete one character
        if (currentPos > 0) {
          setTypedText((prev) => prev.slice(0, -1));
          // Only remove the error state if we're at the end of the typed text
          if (currentPos === typedText.length) {
            setErrors((prev) => prev.slice(0, -1));
          } else {
            // If we're in the middle of the text, just update the error state for this position
            setErrors((prev) => {
              const newErrors = [...prev];
              newErrors[currentPos - 1] = false;
              return newErrors;
            });
          }
        }
      }
      return;
    }

    // Only process character keys
    if (key.length === 1) {
      const isCorrect = key === currentChar;
      
      // Always move forward when a key is pressed
      setTypedText((prev) => prev + key);
      
      // Update error state for this position
      setErrors((prev) => {
        const newErrors = [...prev];
        newErrors[currentPos] = !isCorrect;
        return newErrors;
      });
    }

    // Check if typing is complete
    if (currentPos + 1 >= text.length) {
      setEndTime(new Date());
      setIsTyping(false);
      setIsTypingDone(true);
    }
  };

  useEffect(() => {
    if (endTime && startTime) {
      const totalTimeInMinutes = (endTime - startTime) / 1000 / 60;
      const userWords = typedText.trim().split(/\s+/);
      const correctWords = userWords.filter((word, idx) => 
        word === text.trim().split(/\s+/)[idx]
      ).length;
      
      const actualWPM = Math.round(correctWords / Math.max(0.1, totalTimeInMinutes));
      const totalErrorChars = errors.filter((err) => err).length;
      const charAccuracy = typedText.length > 0 
        ? Math.max(0, ((typedText.length - totalErrorChars) / typedText.length) * 100) 
        : 100;

      setWpm(actualWPM);
      setAccuracy(charAccuracy);
      setResultDetails(prev => ({
        ...prev,
        wpm: actualWPM,
        accuracy: parseFloat(charAccuracy.toFixed(1)),
        time: typingSettings.typingCount === 'Time' 
          ? parseInt(typingSettings.typingOption) || 30 
          : null,
        words: typingSettings.typingCount === 'Words'
          ? parseInt(typingSettings.typingOption) || 50
          : null,
        mode: typingSettings.language === 'Code'
          ? `Code,${typingSettings.codeLanguage || 'N/A'}`
          : `Normal,${typingSettings.language}`,
        testDuration: (endTime - startTime) / 1000
      }));
    }
  }, [endTime, startTime, typedText, text, errors, typingSettings]);
  

  useEffect(() => {
    if (endTime) {
      setIsTypingDone(true);
    }
  }, [endTime]);

  const handleRestart = () => {
    // Reset all states
    setTypedText("");
    setCurrentCharIndex(0);
    setErrors([]);
    setStartTime(null);
    setEndTime(null);
    
    // Reset timer and word count
    if (typingSettings.typingCount === 'Time') {
      setTimeLeft(parseInt(typingSettings.typingOption) || 30);
    } else {
      setTimeLeft(null);
    }
    
    setIsTyping(false);
    setIsTypingDone(false);
    
    // Generate new text with current settings
    if (wordList.length > 0) {
      generateNewText(wordList);
    }
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-7xl mx-auto">
      <Header />
      <div className="mb-4 text-center">
        {typingSettings.typingCount === 'Time' && timeLeft !== null && (
          <div className="text-2xl font-bold text-blue-500">
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
        {typingSettings.typingCount === 'Words' && targetWordCount !== null && (
          <div className="text-xl font-semibold text-green-600">
            Words: {typedText.trim() === '' ? 0 : typedText.trim().split(/\s+/).length} / {targetWordCount}
          </div>
        )}
      </div>
      <ModeSelector 
        onChange={handleModeChange}
        onModeChange={handleModeChange}
      />
      <main className="flex-grow flex flex-col items-center justify-center mb-20">
        {!isTyping && !isTypingDone && (
          <StatsDisplay
            wpm={wpm}
            accuracy={accuracy}
            time={
              startTime && endTime
                ? (endTime.getTime() - startTime.getTime()) / 1000
                : 0
            }
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
                  if (
                    document.activeElement !== inputRef.current &&
                    !isCommandBoxOpen
                  ) {
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
          // result={resultDetails}
          onRestart={handleRestart}
          result={resultDetails}
        />
        
        )}

        {!isTyping && isTypingDone && (
          <div className="text-center text-gray-400 mt-4 space-y-2">
            <p>
              <span className="font-bold text-blue-400">Tab</span> - restart
              test
            </p>
            <p>
              <span className="font-bold text-blue-400">Esc</span> or{" "}
              <span className="font-bold text-blue-400">Ctrl + Shift + P</span>{" "}
              - Open Command box
            </p>
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