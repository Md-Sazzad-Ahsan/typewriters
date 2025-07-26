import React from 'react';
import { IoIosSettings } from "react-icons/io";
import { FaRegUserCircle, FaInfo } from "react-icons/fa";
import { BsKeyboardFill, BsInfoSquare } from "react-icons/bs";

const navButtons = [
  { icon: <BsKeyboardFill className="w-5 h-5 text-gray-400" />, label: 'Keyboard' },
  { icon: <FaInfo className="w-5 h-5 text-gray-400" />, label: 'Info' },
  { icon: <IoIosSettings className="w-5 h-5 text-gray-400" />, label: 'Settings' },
];

export default function Header() {
  return (
    <header className="w-full bg-transparent">
      <div className="flex justify-between items-center py-4 px-4 mx-auto max-w-7xl">
        {/* Left: Logo + Icons */}
        <div className="flex items-center space-x-2 text-lg font-bold text-white">
          <div className="cursor-pointer pr-5" aria-label="Home">
            <span className="text-green-400 text-xl">Type</span>
            <span className="text-white text-xl">Writers</span>
          </div>

          {navButtons.map(({ icon, label }, idx) => (
            <button
              key={idx}
              aria-label={label}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Right: Profile */}
        <button
          className="flex items-center space-x-3 px-5 py-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Profile"
        >
          <FaRegUserCircle className="w-5 h-5 text-gray-400" />
          <span>Profile</span>
        </button>
      </div>
    </header>
  );
}
