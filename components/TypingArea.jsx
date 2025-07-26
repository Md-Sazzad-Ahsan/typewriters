import React from 'react';

export default function TypingArea({ text, typedText, currentCharIndex, errors }) {
  return (
    <div className="text-3xl font-mono leading-relaxed text-gray-300 relative h-64 overflow-hidden">
      {text.split('').map((char, index) => {
        let charClass = '';
        const isTyped = index < typedText.length;
        const isCurrent = index === typedText.length;
        const isError = errors[index] && typedText[index] !== text[index];
        
        if (isTyped) {
          // For characters that have been typed
          charClass = isError ? 'text-red-500' : 'text-green-400';
        } else if (isCurrent) {
          // Current character being typed
          charClass = 'text-blue-400 underline decoration-2 decoration-blue-400';
          
          // Show red background only if current character is wrong
          if (typedText[index] && typedText[index] !== text[index]) {
            charClass = 'text-red-500 bg-red-900 bg-opacity-50 rounded-sm';
          }
        }

        return (
          <span key={index} className={charClass}>
            {char}
          </span>
        );
      })}
    </div>
  );
}