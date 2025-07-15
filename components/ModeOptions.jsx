'use client';
import React, { useState } from 'react';

const modeOptions = ['@Punctuation', '#Number'];
const languageOptions = ['English'];
const codingOptions = ['C/C++', 'Python', 'JS', 'custom'];
const timeOptions = ['15', '30', '60', '120', 'custom'];

export default function ModeOptions() {
  const [activeMode, setActiveMode] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [activeLang, setActiveLang] = useState('');
  const [activeTime, setActiveTime] = useState('');

  const buttonStyle = (active, value) =>
    `transition-colors px-2 py-1 rounded-md ${
      active === value
        ? 'bg-gray-700 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-700'
    }`;

  return (
    <nav className="flex justify-evenly items-center py-2 px-2 mt-5 ring ring-gray-700 bg-gray-850">
      <ul className="flex flex-wrap gap-3 text-sm">
        {modeOptions.map((mode) => (
          <li key={mode}>
            <button
              onClick={() => setActiveMode(mode)}
              className={buttonStyle(activeMode, mode)}
            >
              {mode}
            </button>
          </li>
        ))}

        <span className="text-gray-600">|</span>

        {codingOptions.map((lang) => (
          <li key={lang}>
            <button
              onClick={() => setActiveCode(lang)}
              className={buttonStyle(activeCode, lang)}
            >
              {lang}
            </button>
          </li>
        ))}

        <span className="text-gray-600">|</span>

        {languageOptions.map((lang) => (
          <li key={lang}>
            <button
              onClick={() => setActiveLang(lang)}
              className={buttonStyle(activeLang, lang)}
            >
              {lang}
            </button>
          </li>
        ))}

        <span className="text-gray-600">|</span>

        {timeOptions.map((time) => (
          <li key={time}>
            <button
              onClick={() => setActiveTime(time)}
              className={buttonStyle(activeTime, time)}
            >
              {time}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
