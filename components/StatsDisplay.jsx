import React from 'react';
import { PiGaugeLight } from "react-icons/pi";
import { LuTimer } from "react-icons/lu";
import { FaRegCircleCheck } from "react-icons/fa6";

export default function StatsDisplay({ wpm, accuracy, time }) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-8 text-gray-300 mt-10">
      <div className="flex items-center space-x-2">
        <PiGaugeLight className="size-7 text-yellow-400" />
        <span className="text-xl font-bold">WPM: {Math.round(wpm)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <FaRegCircleCheck className="size-5 text-green-400" />
        <span className="text-xl font-bold">Accuracy: {accuracy.toFixed(1)}%</span>
      </div>
      <div className="flex items-center space-x-2">
        <LuTimer className="w-6 h-6 text-red-400" />
        <span className="text-xl font-bold">Time: {formatTime(time)}</span>
      </div>
    </div>
  );
}