import React, { useEffect, useRef } from 'react';
import { AiOutlineClose } from "react-icons/ai";
export default function CommandBox({ onClose }) {
  const commandBoxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commandBoxRef.current && !commandBoxRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div ref={commandBoxRef} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <AiOutlineClose className="size-5 text-white cursor-pointer" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-blue-400">Command Box</h2>
        <input
          type="text"
          placeholder="Type a command..."
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="mt-4 text-gray-400">
          <p>Example Commands:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>`mode time 60` - Set time to 60 seconds</li>
            <li>`restart` - Restart the current test</li>
            <li>`lang en` - Change language to English</li>
            <li>`help` - Show all commands</li>
          </ul>
        </div>
      </div>
    </div>
  );
}