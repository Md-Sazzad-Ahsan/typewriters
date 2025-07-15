import React from 'react';

export default function TypingArea({ text, typedText, currentCharIndex, errors }) {
  return (
    <div className="text-3xl font-mono leading-relaxed text-gray-300 relative">
      {text.split('').map((char, index) => {
        let charClass = '';
        if (index < currentCharIndex) {
          if (errors[index]) {
            // Character was typed, and it was incorrect
            charClass = 'text-red-500 bg-red-900 bg-opacity-20 rounded-sm';
          } else {
            // Character was typed, and it was correct
            charClass = 'text-green-400';
          }
        } else if (index === currentCharIndex) {
          // This is the current character the user needs to type.
          // We will use the hidden input's native cursor for the actual blinking line.
          // This class simply highlights the character visually.
          charClass = 'text-blue-400 underline decoration-2 decoration-blue-400';
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