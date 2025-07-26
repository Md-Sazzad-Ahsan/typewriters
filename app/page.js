"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
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
  const [typingSettings, setTypingSettings] = useState({
    language: 'English',
    punctuation: true,
    numbers: false,
    codeLanguage: '',
    typingCount: 'Time',
    typingOption: '',
    quoteSize: ''
  });
  const [wordList, setWordList] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [targetWordCount, setTargetWordCount] = useState(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Load words based on language and code language
  useEffect(() => {
    const loadWords = async () => {
      try {
        let wordFilePath = '';
        
        if (typingSettings.language === 'English') {
          wordFilePath = '/words/English/common3k.txt';
        } else if (typingSettings.language === 'Bangla') {
          wordFilePath = '/words/Bangla/ShortWordsList.txt';
        } else if (typingSettings.language === 'Code' && typingSettings.codeLanguage) {
          const codeLanguageMap = {
            'C/C++': '/words/Coding/c_cpp_words.txt',
            'Python': '/words/Coding/python_words.txt',
            'Flutter': '/words/Coding/flutter_dart_words.txt',
            'JavaScript': '/words/Coding/javascript_words.txt',
            'Java': '/words/Coding/java_words.txt'
          };
          wordFilePath = codeLanguageMap[typingSettings.codeLanguage] || '';
        }

        if (wordFilePath) {
          const response = await fetch(wordFilePath);
          if (!response.ok) throw new Error(`Failed to load word list: ${response.status}`);
          
          const text = await response.text();
          const words = text.split(/\s+/).filter(word => word.trim() !== '');
          setWordList(words);
          
          // If we have words, update the text with a new set of words
          if (words.length > 0) {
            generateNewText(words);
          }
        }
      } catch (error) {
        console.error('Error loading word list:', error);
        // Fallback to default words if there's an error
        const defaultWords = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "I"];
        setWordList(defaultWords);
        generateNewText(defaultWords);
      }
    };

    loadWords();
  }, [typingSettings.language, typingSettings.codeLanguage]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start or stop timer based on typing state and settings
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

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
    };
  }, [isTyping, typingSettings.typingCount, typingSettings.typingOption]);

  // Check word count for word-based tests
  useEffect(() => {
    if (!isTyping || typingSettings.typingCount !== 'Words' || !targetWordCount) return;
    
    // Count words more accurately, handling multiple spaces
    const currentWordCount = typedText.trim() === '' ? 0 : typedText.trim().split(/\s+/).length;
    
    if (currentWordCount >= targetWordCount) {
      // Get the first N words from the original text
      const targetWords = text.split(/\s+/).slice(0, targetWordCount);
      const targetText = targetWords.join(' ');
      
      // Update the displayed text to exactly match the target word count
      setText(targetText);
      
      // Truncate the user's input to match the target word count
      const userWords = typedText.trim().split(/\s+/);
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

  const generateNewText = (words) => {
    if (!words || words.length === 0) return;
    
    // Generate text based on the current typing settings
    let wordCount = 50; // Default word count
    
    if (typingSettings.typingCount === 'Words') {
      const target = parseInt(typingSettings.typingOption);
      if (isNaN(target) || target < 1) {
        wordCount = 50; // Fallback to default if invalid
      } else {
        wordCount = Math.max(10, target); // Ensure minimum of 10 words
      }
      setTargetWordCount(wordCount);
    } else if (typingSettings.typingCount === 'Time') {
      // For time-based tests, generate enough words for the time limit
      const timeLimit = parseInt(typingSettings.typingOption) || 30;
      // Estimate words per minute and generate enough words
      const estimatedWPM = 40; // Average typing speed
      wordCount = Math.max(30, Math.ceil((estimatedWPM * timeLimit) / 60));
      setTimeLeft(timeLimit);
    } else if (typingSettings.typingCount === 'Quote') {
      // For quotes, we'll handle this differently if needed
      wordCount = 30; // Default for quotes
    }

    // Select random words from the word list
    const selectedWords = [];
    for (let i = 0; i < wordCount && words.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWords.push(words[randomIndex]);
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

  const handleModeChange = (newSettings) => {
    console.log('New typing settings:', newSettings);
    setTypingSettings(newSettings);
  };

  useEffect(() => {
    // Use a predefined set of words
    const words = [
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "I",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "we",
      "say",
      "her",
      "she",
      "or",
      "an",
      "will",
      "my",
      "one",
      "all",
      "would",
      "there",
      "their",
      "what",
      "so",
      "up",
      "out",
      "if",
      "about",
      "who",
      "get",
      "which",
      "go",
      "me",
      "when",
      "make",
      "can",
      "like",
      "time",
      "no",
      "just",
      "him",
      "know",
      "take",
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
      const timeInSeconds = (endTime - startTime) / 1000;
      const wordsTyped = typedText.split(" ").length;
      setWpm(Math.round((wordsTyped / timeInSeconds) * 60));

      const totalChars = text.length;
      const errorChars = errors.filter((err) => err).length;
      const correctChars = totalChars - errorChars;
      setAccuracy(Math.round((correctChars / totalChars) * 100));
    }
  }, [endTime, startTime]);

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
        onModeChange={handleModeChange}
        onChange={handleModeChange}
      />
      <main className="flex-grow flex flex-col items-center justify-center space-y-8">
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
