import React from 'react';
import { IoIosSettings } from "react-icons/io";
import { FaRegUserCircle } from "react-icons/fa";
import { BsKeyboardFill,BsFillInfoCircleFill } from "react-icons/bs";

export default function Header() {
  return (
    <header className="flex justify-between items-center py-4 px-2">
      <div className="flex items-center space-x-2 text-lg font-bold text-white">
       <div href="/" className="cursor-pointer"> <span className="text-green-400 text-xl">Type</span><span className="text-white text-xl">Writers</span></div>
        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <BsKeyboardFill className="w-5 h-5 text-gray-400" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
        <BsFillInfoCircleFill className="w-5 h-5 text-gray-400" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <IoIosSettings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* This nav was for the mode options, but they are now in a separate component. */}
      {/* <nav className="flex space-x-4 text-gray-400">...</nav> */}

      <div className="">
        <button className="flex items-center space-x-3 px-5 py-2 rounded-full hover:bg-gray-700 transition-colors">
          <FaRegUserCircle className="w-5 h-5 text-gray-400" />
          <span className="">Profile</span>
        </button>
      </div>
    </header>
  );
}