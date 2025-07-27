import { useEffect, useState } from 'react';
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { RiTimer2Line } from "react-icons/ri";
import { BsAlphabetUppercase } from "react-icons/bs";
import { CgQuoteO } from "react-icons/cg";

const defaultModes = {
  language: 'English',
  punctuation: false,
  numbers: false,
  codeLanguage: '',
  typingCount: 'Time',
  typingOption: '30',
  quoteSize: '',
};

const typingOptionsMap = {
  Time: ['15', '30', '60', '120', 'Custom'],
  Words: ['15', '25', '50', '100', 'Custom'],
  Quote: ['Short', 'Medium', 'Long'],
};

const codeLanguages = ['C/C++', 'Python', 'JavaScript', 'Flutter', 'Java'];

export default function ModeSelector({ onChange, onModeChange }) {
  const [selectedModes, setSelectedModes] = useState(defaultModes);
  const [showCodeOptions, setShowCodeOptions] = useState(false);
  const [codeOptionsTimeout, setCodeOptionsTimeout] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('selectedModes');
    if (stored) {
      const { characterModes, ...cleanStored } = JSON.parse(stored);
      setSelectedModes({ ...defaultModes, ...cleanStored });
    }
  }, []);

  // Combined effect for localStorage, parent notification, and API sync
  useEffect(() => {
    // Save to localStorage
    const { characterModes, ...cleanState } = selectedModes;
    localStorage.setItem('selectedModes', JSON.stringify(cleanState));

    // Notify parent
    onChange?.(selectedModes);
    onModeChange?.(selectedModes);

    // Sync with API
    if (typeof window !== 'undefined') {
      const sync = async () => {
        try {
          const response = await fetch('/api/modes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanState),
          });
          if (!response.ok) {
            console.warn('Failed to save modes to API:', response.status);
          }
        } catch {
          console.warn('Could not connect to modes API, using localStorage only');
        }
      };
      
      const timer = setTimeout(sync, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedModes, onChange, onModeChange]);

  // Cleanup on unmount
  useEffect(() => () => codeOptionsTimeout && clearTimeout(codeOptionsTimeout), [codeOptionsTimeout]);

  const update = (key, value) => {
    setSelectedModes(prev => {
      if (prev[key] === value) return prev; // No change needed

      // Create a new state object based on the previous state
      const newState = { ...prev };

      if (key === 'typingCount') {
        const current = prev.typingCount;
        if (value === 'Words' || value === 'Time') {
          if (current === value && prev.typingOption) return prev; // already selected
          newState.typingCount = value;
          newState.typingOption = value === 'Words' ? '50' : '60';
          newState.quoteSize = '';
        } else if (value === 'Quote') {
          if (current === 'Quote' && prev.quoteSize) return prev;
          newState.typingCount = value;
          newState.quoteSize = prev.quoteSize || 'Medium';
        }
        return newState;
      }

      if (key === 'language') {
        if (prev.language === value) return prev;
        newState.language = value;
        newState.codeLanguage = value === 'Code' ? (prev.codeLanguage || 'C/C++') : '';
        return newState;
      }

      // For other updates
      return { ...newState, [key]: value };
    });
  };
  

  const toggleCharacter = (char) => {
    if (['Punctuation', 'Numbers'].includes(char)) {
      const key = char.toLowerCase();
      setSelectedModes(prev => {
        const newValue = !prev[key];
        if (prev[key] === newValue) return prev; // No change
        return { ...prev, [key]: newValue };
      });
      return;
    }
  
    // Code toggle
    if (selectedModes.language !== 'Code') {
      setSelectedModes(prev => ({
        ...prev,
        language: 'Code',
        codeLanguage: prev.codeLanguage || 'C/C++',
      }));
      setShowCodeOptions(true);
      const timeout = setTimeout(() => setShowCodeOptions(false), 4000);
      setCodeOptionsTimeout(timeout);
    } else {
      setShowCodeOptions(prev => {
        const newState = !prev;
        if (codeOptionsTimeout) clearTimeout(codeOptionsTimeout);
        if (newState) {
          const timeout = setTimeout(() => setShowCodeOptions(false), 4000);
          setCodeOptionsTimeout(timeout);
        }
        return newState;
      });
    }
  };
  

  const handleCodeLanguageSelect = (lang) => {
    codeOptionsTimeout && clearTimeout(codeOptionsTimeout);
    update('codeLanguage', lang);
    setShowCodeOptions(false);
  };

  const getIconForMode = (mode) => {
    const icons = {
      Time: <RiTimer2Line />,
      Words: <BsAlphabetUppercase />,
      Quote: <CgQuoteO />,
      Custom: <HiOutlineWrenchScrewdriver />,
    };
    return icons[mode] || null;
  };

  const typingCountOptions = typingOptionsMap[selectedModes.typingCount];

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
            >
              {lang}
            </button>
          ))}

          {/* Code Button */}
          <button
            onClick={() => toggleCharacter('Code')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${selectedModes.language === 'Code' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
          >
            Code
          </button>

          {/* Code Language Selector */}
          {selectedModes.language === 'Code' && showCodeOptions && (
            <div className="flex items-center gap-1">
              {codeLanguages.map(lang => (
                <button
                  key={lang}
                  onClick={() => handleCodeLanguageSelect(lang)}
                  className={`px-3 py-1 rounded transition-colors ${selectedModes.codeLanguage === lang ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          {/* Custom Button */}
          <button
            onClick={() => update('language', 'Custom')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${selectedModes.language === 'Custom' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
          >
            <HiOutlineWrenchScrewdriver />
            <span className="sr-only">Custom</span>
          </button>
        </div>

        <span className="text-gray-500">|</span>

        {/* Character Mode */}
        <div className="flex items-center gap-2">
          {['Punctuation', 'Numbers'].map(char => {
            const key = char.toLowerCase();
            return (
              <button
                key={char}
                onClick={() => toggleCharacter(char)}
                className={`px-3 py-1 rounded transition-colors ${selectedModes[key] ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
              >
                {char}
              </button>
            );
          })}
        </div>

        <span className="text-gray-500">|</span>

        {/* Typing Mode */}
        <div className="flex items-center gap-2">
          {['Time', 'Words', 'Quote'].map(mode => (
            <button
              key={mode}
              onClick={() => update('typingCount', mode)}
              className={`px-3 py-1 rounded transition-colors ${selectedModes.typingCount === mode ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
            >
              <span className="flex items-center gap-1">
                {getIconForMode(mode)}
                <span className="sr-only">{mode}</span>
              </span>
            </button>
          ))}
        </div>

        <span className="text-gray-500">|</span>

        {/* Typing Options */}
        <div className="flex items-center gap-2">
          {typingCountOptions.map(opt => {
            const isSelected = selectedModes.typingCount === 'Quote'
              ? selectedModes.quoteSize === opt
              : selectedModes.typingOption === opt;

            return (
              <button
                key={opt}
                onClick={() =>
                  selectedModes.typingCount === 'Quote'
                    ? update('quoteSize', opt)
                    : update('typingOption', opt)
                }
                className={`px-3 py-1 rounded transition-colors ${isSelected ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'}`}
              >
                {opt === 'Custom' ? (
                  <>
                    <HiOutlineWrenchScrewdriver />
                    <span className="sr-only">{opt}</span>
                  </>
                ) : (
                  opt
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
