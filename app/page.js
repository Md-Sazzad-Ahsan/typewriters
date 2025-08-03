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
import { loadModeSetFromStorage, saveModeSetToStorage } from "@/models/ModeSet";
import { 
  FaRedo, 
  FaExclamationTriangle, 
  FaCertificate, 
  FaShare, 
  FaArrowRight 
} from "react-icons/fa";

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
    language: "English",
    punctuation: false,
    numbers: false,
    capitals: false,
    codeLanguage: "",
    modeType: "Time",
    timeLimit: 30,
    wordLimit: 50,
    quoteSize: "medium",
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage after hydration
  useEffect(() => {
    const savedSettings = loadModeSetFromStorage();
    setTypingSettings({
      language: savedSettings.language || "English",
      punctuation: savedSettings.testModes?.punctuation ?? true,
      numbers: savedSettings.testModes?.numbers ?? false,
      capitals: savedSettings.testModes?.capitals ?? false,
      codeLanguage: savedSettings.codeLanguage || "",
      modeType: savedSettings.modeType || "Time",
      timeLimit: savedSettings.timeLimit || 30,
      wordLimit: savedSettings.wordLimit || 50,
      quoteSize: savedSettings.quoteSize || "medium",
    });
    setIsHydrated(true);
  }, []);

  const handleModeChange = useCallback((newModes) => {
    console.log("New typing settings:", newModes);
    setTypingSettings(newModes);
    
    // Save to localStorage whenever modes change
    const modeSetData = {
      language: newModes.language,
      codeLanguage: newModes.codeLanguage,
      modeType: newModes.modeType,
      quoteSize: newModes.quoteSize,
      timeLimit: newModes.timeLimit,
      wordLimit: newModes.wordLimit,
      testModes: {
        punctuation: newModes.punctuation,
        numbers: newModes.numbers,
        capitals: newModes.capitals,
      }
    };
    saveModeSetToStorage(modeSetData);
  }, []);

  const [wordList, setWordList] = useState([]);
  const [timeLeft, setTimeLeft] = useState(typingSettings.timeLimit);
  const [targetWordCount, setTargetWordCount] = useState(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const [resultDetails, setResultDetails] = useState({
    wpm: 0,
    accuracy: 100,
    time: null,
    words: null,
    mode: "Normal,English",
    testDuration: 0,
  });

  // Reset test and regenerate words when typing settings change
  useEffect(() => {
    let isMounted = true;
    
    const regenerateWords = async () => {
      try {
        const wordCount = getTargetWordCount(typingSettings);
        setTargetWordCount(wordCount);

        if (typingSettings.modeType === "Time") {
          setTimeLeft(typingSettings.timeLimit);
        }

        // Force a fresh word list by fetching new words
        const newWords = await fetchWords(
          typingSettings.language,
          typingSettings.codeLanguage
        );
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        setWordList(newWords); // Update the word list state
        const selectedWords = generateRandomWords(newWords, wordCount, true);
        setText(selectedWords.join(" "));

        // Reset test state
        setTypedText("");
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
        console.error("Error regenerating words:", error);
      }
    };

    regenerateWords();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [
    typingSettings.modeType,
    typingSettings.timeLimit,
    typingSettings.wordLimit,
    typingSettings.quoteSize,
    typingSettings.language,
    typingSettings.codeLanguage,
  ]);

  // Function to fetch words based on language and code language
  const fetchWords = async (language, codeLanguage = "") => {
    try {
      let wordFilePath = "";
      if (language === "English") {
        wordFilePath = "/words/English/common3k.txt";
      } else if (language === "Bangla") {
        wordFilePath = "/words/Bangla/ShortWordsList.txt";
      } else if (language === "Code" && codeLanguage) {
        const codeLanguageMap = {
          "C/C++": "/words/Coding/c_cpp_words.txt",
          Python: "/words/Coding/python_words.txt",
          JavaScript: "/words/Coding/javascript_words.txt",
          Java: "/words/Coding/java_words.txt",
          Flutter: "/words/Coding/flutter_dart_words.txt",
        };
        wordFilePath =
          codeLanguageMap[codeLanguage] || "/words/English/common3k.txt";
      } else {
        wordFilePath = "/words/English/common3k.txt";
      }

      const response = await fetch(wordFilePath);
      if (!response.ok) {
        throw new Error(`Failed to load words from ${wordFilePath}`);
      }
      const text = await response.text();
      return text.split(/\s+/).filter((word) => word.trim() !== "");
    } catch (error) {
      console.error("Error loading words:", error);
      return [
        "the",
        "quick",
        "brown",
        "fox",
        "jumps",
        "over",
        "the",
        "lazy",
        "dog",
      ];
    }
  };

  // Load words based on language and code language
  useEffect(() => {
    let isMounted = true;
    
    const loadWords = async () => {
      try {
        const newWords = await fetchWords(
          typingSettings.language,
          typingSettings.codeLanguage
        );
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        setWordList(newWords);

        const wordCount = getTargetWordCount(typingSettings);
        const selectedWords = generateRandomWords(newWords, wordCount, true);
        setText(selectedWords.join(" "));
        setTargetWordCount(wordCount);

        if (typingSettings.modeType === "Time") {
          setTimeLeft(typingSettings.timeLimit);
        }
      } catch (error) {
        console.error("Error loading word list:", error);
        const defaultWords = [
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
        ];
        setWordList(defaultWords);
        const wordCount = getTargetWordCount(typingSettings);
        const selectedWords = generateRandomWords(
          defaultWords,
          wordCount,
          true
        );
        setText(selectedWords.join(" "));
      }
    };

    loadWords();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [
    typingSettings.language,
    typingSettings.codeLanguage,
    typingSettings.modeType,
    typingSettings.timeLimit,
    typingSettings.wordLimit,
    typingSettings.quoteSize,
  ]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update time left display when typing starts or settings change
  useEffect(() => {
    if (isTyping && typingSettings.modeType === 'Time') {
      // Set initial time left to the full time limit
      setTimeLeft(typingSettings.timeLimit);
      
      // Set up the interval to update the time left
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isTyping, typingSettings.modeType, typingSettings.timeLimit]);

  // Start or stop timer based on typing state and settings
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (testIntervalRef.current) clearInterval(testIntervalRef.current);

    timerRef.current = null;
    testIntervalRef.current = null;

    if (isTyping && typingSettings.modeType === "Time") {
      const timeLimit = typingSettings.timeLimit;
      setTimeLeft(timeLimit);

      const startTime = Date.now();
      const endTime = startTime + timeLimit * 1000;

      const updateTimer = () => {
        const now = Date.now();
        const timeElapsed = (now - startTime) / 1000; // in seconds
        
        // Only update time left when a full second has passed
        if (timeElapsed >= 1) {
          const timeRemaining = Math.max(0, timeLimit - Math.ceil(timeElapsed));
          setTimeLeft(timeRemaining);
        }

        if (timeElapsed >= timeLimit) {
          setTimeLeft(0);
          setIsTyping(false);
          setEndTime(new Date());
          setIsTypingDone(true);
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 200);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
      }
    };
  }, [isTyping, typingSettings.modeType, typingSettings.timeLimit]);

  // Track word count for word-based tests
  useEffect(() => {
    if (!isTyping || typingSettings.modeType !== "Words" || !targetWordCount)
      return;

    const currentWordCount =
      typedText.trim() === "" ? 0 : typedText.trim().split(/\s+/).length;
    const targetWords = text.split(/\s+/).slice(0, targetWordCount);
    const targetText = targetWords.join(" ");

    const userWords = typedText.trim().split(/\s+/);
    const hasTypedAllWords =
      userWords.length >= targetWordCount &&
      userWords.slice(0, targetWordCount).join(" ") ===
        targetWords
          .slice(0, Math.min(targetWordCount, userWords.length))
          .join(" ");

    if (hasTypedAllWords) {
      setText(targetText);
      if (userWords.length > targetWordCount) {
        const truncatedText = userWords.slice(0, targetWordCount).join(" ");
        setTypedText(truncatedText);
      }
      setIsTyping(false);
      setEndTime(new Date());
      setIsTypingDone(true);
    }
  }, [typedText, isTyping, typingSettings.modeType, targetWordCount, text]);

  const generateNewText = (wordList) => {
    if (!wordList || wordList.length === 0) {
      console.error("No words available to generate text");
      return;
    }

    const wordCount = getTargetWordCount(typingSettings);
    setTargetWordCount(wordCount);

    const selectedWords = generateRandomWords(wordList, wordCount, true);

    if (typingSettings.modeType === "Time") {
      setTimeLeft(typingSettings.timeLimit);
    }

    setText(selectedWords.join(" "));
    setTypedText("");
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
    e.preventDefault(); // Prevent default behavior

    // If the test is done, or if a non-character key (like Shift, Ctrl) is pressed, do nothing.
    if (isTypingDone || (e.key.length > 1 && e.key !== "Backspace")) {
      return;
    }

    // Start the test only when a printable character is typed.
    if (!isTyping && e.key.length === 1) {
      const now = new Date();
      setStartTime(now);
      setIsTyping(true);
      
      // Initialize with full time for immediate display
      if (typingSettings.modeType === 'Time') {
        setTimeLeft(typingSettings.timeLimit);
      }
      
      // Force an immediate WPM update
      const correctChars = (typedText + e.key).split('').filter((char, i) => char === text[i]).length;
      const wordsTyped = correctChars / 5;
      setWpm(Math.round(wordsTyped / 0.1)); // Using a small initial time to avoid division by zero
      setAccuracy(Math.round((correctChars / Math.max(1, typedText.length + 1)) * 100));
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
          while (
            wordStart > 0 &&
            (currentTypedText[wordStart - 1] === " " ||
              text[wordStart - 1] === " ")
          ) {
            wordStart--;
          }

          // Now find the start of the actual word (go back to the beginning of the word)
          while (
            wordStart > 0 &&
            currentTypedText[wordStart - 1] !== " " &&
            text[wordStart - 1] !== " "
          ) {
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
            const wordsTyped = Math.max(
              0,
              wordStart - (wordStart > 0 && text[wordStart - 1] === " " ? 1 : 0)
            );
            const newWpm = Math.round(
              wordsTyped / 5 / Math.max(0.1, timeElapsed)
            );
            setWpm(newWpm);

            // Recalculate accuracy
            const newErrors = errors.slice(0, wordStart);
            const correctChars = newErrors.filter((e) => !e).length;
            const newAccuracy = Math.round(
              (correctChars / Math.max(1, wordStart)) * 100
            );
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

  // Update WPM and accuracy in real-time as the user types
  useEffect(() => {
    if (!isTyping || !startTime) return;

    const updateWPM = () => {
      const now = new Date();
      const timeElapsed = (now - startTime) / 1000 / 60; // in minutes
      const correctChars = typedText.split('').filter((char, i) => char === text[i]).length;
      const wordsTyped = correctChars / 5; // Standard word is 5 characters
      const currentWPM = Math.round(wordsTyped / Math.max(0.1, timeElapsed));
      
      setWpm(currentWPM);
      setAccuracy(Math.round((correctChars / Math.max(1, typedText.length)) * 100));
    };

    // Update WPM every 200ms for smoother updates
    const interval = setInterval(updateWPM, 200);
    return () => clearInterval(interval);
  }, [isTyping, startTime, typedText, text]);

  // Update final results when test ends
  useEffect(() => {
    if (endTime && startTime) {
      const totalTimeInSeconds = (endTime - startTime) / 1000;
      const totalTimeInMinutes = totalTimeInSeconds / 60;
      const userWords = typedText.trim().split(/\s+/);
      const correctWords = userWords.filter(
        (word, idx) => word === text.trim().split(/\s+/)[idx]
      ).length;

      const actualWPM = Math.round(
        correctWords / Math.max(0.1, totalTimeInMinutes)
      );
      const totalErrorChars = errors.filter((err) => err).length;
      const charAccuracy =
        typedText.length > 0
          ? Math.max(
              0,
              ((typedText.length - totalErrorChars) / typedText.length) * 100
            )
          : 100;

      setWpm(actualWPM);
      setAccuracy(charAccuracy);
      setResultDetails((prev) => ({
        ...prev,
        wpm: actualWPM,
        accuracy: parseFloat(charAccuracy.toFixed(1)),
        time:
          typingSettings.modeType === "Time" ? typingSettings.timeLimit : null,
        words:
          typingSettings.modeType === "Words" ? typingSettings.wordLimit : null,
        mode:
          typingSettings.language === "Code"
            ? `Code,${typingSettings.codeLanguage || "N/A"}`
            : `Normal,${typingSettings.language}`,
        testDuration: (endTime - startTime) / 1000,
      }));
    }
  }, [endTime, startTime, typedText, text, errors, typingSettings]);

  useEffect(() => {
    if (endTime) {
      setIsTypingDone(true);
    }
  }, [endTime]);

  const handleRestart = async () => {
    // Reset all typing state
    setTypedText("");
    setCurrentCharIndex(0);
    setErrors([]);
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);

    if (typingSettings.modeType === "Time") {
      setTimeLeft(typingSettings.timeLimit);
    } else {
      setTimeLeft(null);
    }

    // Generate new words for the test
    try {
      const newWords = await fetchWords(
        typingSettings.language,
        typingSettings.codeLanguage
      );
      
      const wordCount = getTargetWordCount(typingSettings);
      const selectedWords = generateRandomWords(newWords, wordCount, true);
      setText(selectedWords.join(" "));
      setWordList(newWords);
      setTargetWordCount(wordCount);
    } catch (error) {
      console.error("Error generating new words:", error);
    }

    // Update UI state
    setIsTyping(false);
    setIsTypingDone(false);

    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-7xl mx-auto">
      <Header isTyping={isTyping} />
      {!isTyping && !isTypingDone && (
        <ModeSelector
          onChange={handleModeChange}
          onModeChange={handleModeChange}
          initialSettings={isHydrated ? typingSettings : undefined}
        />
      )}
      <main className="flex-grow flex flex-col items-center mt-10 mb-2">
        {/* {!isTyping && !isTypingDone && (
          <StatsDisplay
            wpm={wpm}
            accuracy={accuracy}
            time={
              startTime && endTime
                ? (endTime.getTime() - startTime.getTime()) / 1000
                : 0
            }
          />
        )} */}

        {!isTypingDone ? (
          <div
            className="relative w-full px-6 rounded-lg shadow-lg cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="mb-4 text-left font-semibold text-md text-gray-500 uppercase">
              {typingSettings.modeType === "Time" && timeLeft !== null && (
                <div className="">
                  Time {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </div>
              )}
              {typingSettings.modeType === "Words" &&
                targetWordCount !== null && (
                  <div className="">
                    Words:{" "}
                    {typedText.trim() === ""
                      ? 0
                      : typedText.trim().split(/\s+/).length}{" "}
                    / {targetWordCount}
                  </div>
                )}
            </div>
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
          <div className="w-full">
            <Result onRestart={handleRestart} />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 mb-6">
              <button
                onClick={handleRestart}
                className="flex items-center px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Repeat the test"
              >
                <FaRedo className="mr-2" />
                Repeat
              </button>
              <button
                onClick={() => {}}
                className="flex items-center px-4 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                title="View mistyped words"
              >
                <FaExclamationTriangle className="mr-2" />
                Mistyped
              </button>
              <button
                onClick={() => {}}
                className="flex items-center px-4 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                title="Get certificate"
              >
                <FaCertificate className="mr-2" />
                Certificate
              </button>
              <button
                onClick={() => {}}
                className="flex items-center px-4 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                title="Share your results"
              >
                <FaShare className="mr-2" />
                Share
              </button>
              <button
                onClick={() => {}}
                className="flex items-center px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                title="Next test"
              >
                Next
                <FaArrowRight className="ml-2" />
              </button>
            </div>

            <div className="text-center text-gray-400 mt-6 space-y-2">
              <p>
                <span className="font-bold text-blue-400">Tab</span> - restart test
              </p>
              <p>
                <span className="font-bold text-blue-400">Esc</span> or{" "}
                <span className="font-bold text-blue-400">Ctrl + Shift + P</span>{" "}
                - Open Command box
              </p>
            </div>
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
