// Optimized version of ModeSelector without removing any feature or styling
import { useEffect, useState } from 'react';
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { RiTimer2Line } from "react-icons/ri";
import { BsAlphabetUppercase } from "react-icons/bs";
import { CgQuoteO } from "react-icons/cg";
import { loadModeSetFromStorage, saveModeSetToStorage } from '../models/ModeSet';

const defaultModes = {
  language: 'English',
  punctuation: false,
  numbers: false,
  codeLanguage: '',
  modeType: 'Time',
  timeLimit: 30,
  wordLimit: 50,
  quoteSize: 'medium',
};

const typingOptionsMap = {
  Time: [15, 30, 60, 120, 'Custom'],
  Words: [15, 25, 50, 100, 'Custom'],
  Quote: ['short', 'medium', 'long'],
};

const codeLanguages = ['C/C++', 'Python', 'JavaScript', 'Flutter', 'Java'];

const mapModeSetToModes = (modeSet) => {
  const { modeType, language, codeLanguage = '', testModes = {}, quoteSize = 'medium', timeLimit = 60, wordLimit = 50 } = modeSet;

  return {
    language,
    codeLanguage,
    modeType,
    punctuation: testModes.punctuation || false,
    numbers: testModes.numbers || false,
    quoteSize,
    timeLimit,
    wordLimit,
  };
};

const mapModesToModeSet = (modes) => ({
  language: modes.language,
  codeLanguage: modes.codeLanguage || 'C/C++',
  modeType: modes.modeType,
  quoteSize: modes.quoteSize || 'medium',
  timeLimit: modes.timeLimit || 60,
  wordLimit: modes.wordLimit || 50,
  testModes: {
    punctuation: modes.punctuation || false,
    numbers: modes.numbers || false,
    capitals: false,
  }
});

export default function ModeSelector({ onChange, onModeChange }) {
  const [selectedModes, setSelectedModes] = useState(defaultModes);
  const [showCodeOptions, setShowCodeOptions] = useState(false);
  const [codeOptionsTimeout, setCodeOptionsTimeout] = useState(null);

  useEffect(() => {
    const storedModes = loadModeSetFromStorage();
    setSelectedModes(mapModeSetToModes(storedModes));
  }, []);

  useEffect(() => {
    const modeSet = mapModesToModeSet(selectedModes);
    saveModeSetToStorage(modeSet);
    onChange?.(selectedModes);
    onModeChange?.(selectedModes);

    if (typeof window !== 'undefined') {
      const sync = async () => {
        try {
          const response = await fetch('/api/modes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modeSet),
          });
          if (!response.ok) console.warn('Failed to save modes to API:', response.status);
        } catch {
          console.warn('Could not connect to modes API, using localStorage only');
        }
      };
      const timer = setTimeout(sync, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedModes, onChange, onModeChange]);

  useEffect(() => () => codeOptionsTimeout && clearTimeout(codeOptionsTimeout), [codeOptionsTimeout]);

  const update = (key, value) => {
    setSelectedModes(prev => {
      if (prev[key] === value) return prev;
      const newState = { ...prev, [key]: value };

      if (key === 'language') {
        if (value === 'Code') {
          newState.codeLanguage = prev.codeLanguage || 'C/C++';
        } else {
          newState.codeLanguage = '';
        }
      }

      // When switching modes, reset to a default value if the current isn't valid for the new mode.
      if (key === 'modeType') {
        if (value === 'Time' && !typingOptionsMap.Time.includes(prev.timeLimit)) {
          newState.timeLimit = 30;
        }
        if (value === 'Words' && !typingOptionsMap.Words.includes(prev.wordLimit)) {
          newState.wordLimit = 50;
        }
        if (value === 'Quote' && !typingOptionsMap.Quote.includes(prev.quoteSize)) {
          newState.quoteSize = 'medium';
        }
      }

      return newState;
    });
  };

  const toggleCharacter = (char) => {
    if (['Punctuation', 'Numbers'].includes(char)) {
      const key = char.toLowerCase();
      setSelectedModes(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (char === 'Code') {
      if (selectedModes.modeType === 'Quote') return;
      const newLang = selectedModes.language === 'Code' ? 'English' : 'Code';
      update('language', newLang);

      if (newLang === 'Code') {
        setShowCodeOptions(true);
        const timeout = setTimeout(() => setShowCodeOptions(false), 4000);
        setCodeOptionsTimeout(timeout);
      } else {
        setShowCodeOptions(false);
      }
    }
  };

  const handleCodeLanguageSelect = (lang) => {
    codeOptionsTimeout && clearTimeout(codeOptionsTimeout);
    update('codeLanguage', lang);
    setShowCodeOptions(false);
  };

  const getIconForMode = (mode) => {
    const icons = {
      Time: <RiTimer2Line />, Words: <BsAlphabetUppercase />, Quote: <CgQuoteO />, Custom: <HiOutlineWrenchScrewdriver />,
    };
    return icons[mode] || null;
  };

  const renderOptions = () => {
    const { modeType } = selectedModes;
    const options = typingOptionsMap[modeType];

    let valueKey, updateKey;
    if (modeType === 'Time') { valueKey = 'timeLimit'; updateKey = 'timeLimit'; }
    if (modeType === 'Words') { valueKey = 'wordLimit'; updateKey = 'wordLimit'; }
    if (modeType === 'Quote') { valueKey = 'quoteSize'; updateKey = 'quoteSize'; }

    return options.map(opt => {
      const isSelected = selectedModes[valueKey] === opt;
      return (
        <button
          key={opt}
          onClick={() => update(updateKey, opt)}
          className={`px-3 py-1 rounded transition-colors ${isSelected ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
        >
          {opt === 'Custom' ? <><HiOutlineWrenchScrewdriver /><span className="sr-only">{opt}</span></> : opt}
        </button>
      );
    });
  };

  return (
    <div className="px-4 pt-5 pb-2 shadow-lg flex flex-col items-center text-sm text-white overflow-hidden">
      <div className="flex justify-center gap-4 w-full">

        {/* Language Mode */}
        <div className="flex items-center gap-2">
          {['English', 'Bangla'].map(lang => (
            <button
              key={lang}
              onClick={() => update('language', lang)}
              className={`px-3 py-1 rounded transition-colors ${selectedModes.language === lang ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
            >{lang}</button>
          ))}
          <button
            onClick={() => toggleCharacter('Code')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${selectedModes.language === 'Code' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
          >Code</button>

          {selectedModes.language === 'Code' && showCodeOptions && (
            <div className="flex items-center gap-1">
              {codeLanguages.map(lang => (
                <button
                  key={lang}
                  onClick={() => handleCodeLanguageSelect(lang)}
                  className={`px-3 py-1 rounded transition-colors ${selectedModes.codeLanguage === lang ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
                >{lang}</button>
              ))}
            </div>
          )}

          <button
            onClick={() => update('language', 'Custom')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${selectedModes.language === 'Custom' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
          >
            <HiOutlineWrenchScrewdriver /><span className="sr-only">Custom</span>
          </button>
        </div>

        <span className="text-gray-500">|</span>

        {selectedModes.language !== 'Code' && (
          <div className="flex items-center gap-2">
            {['Punctuation', 'Numbers'].map(char => (
              <button
                key={char}
                onClick={() => toggleCharacter(char)}
                className={`px-3 py-1 rounded transition-colors ${selectedModes[char.toLowerCase()] ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
              >{char}</button>
            ))}
          </div>
        )}

        <span className="text-gray-500">|</span>

        <div className="flex items-center gap-2">
          {['Time', 'Words', 'Quote'].map(mode => {
            const isDisabled = selectedModes.language === 'Code' && mode === 'Quote';
            return (
              <button
                key={mode}
                onClick={() => !isDisabled && update('modeType', mode)}
                disabled={isDisabled}
                className={`px-3 py-1 rounded transition-colors ${
                  selectedModes.modeType === mode ? 'bg-red-500 text-white'
                    : isDisabled ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'
                }`}
              >
                <span className="flex items-center gap-1">{getIconForMode(mode)}<span className="sr-only">{mode}</span></span>
              </button>
            );
          })}
        </div>

        <span className="text-gray-500">|</span>

        <div className="flex items-center gap-2">
          {renderOptions()}
        </div>

      </div>
    </div>
  );
}
