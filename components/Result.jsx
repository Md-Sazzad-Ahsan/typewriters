export default function Result({ wpm, accuracy, mode, raw, characters, weakWords, onRestart }) {
  return (
    <div className="w-full p-6 rounded-lg shadow-lg text-white space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center text-3xl font-semibold">
        <div>
          <p>WPM</p>
          <p className="font-normal pt-2">{Math.round(wpm)}</p>
        </div>
        <div>
          <p>ACC</p>
          <p className="font-normal pt-2">{Math.round(accuracy)}%</p>
        </div>
        <div>
          <p>MODE</p>
          <p className="font-normal pt-2">{mode}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center mt-20">
        <div>
          <p className="text-lg">Raw WPM</p>
          <p className="text-xl">{Math.round(raw)}</p>
        </div>
        <div>
          <p className="text-lg">Character Typed</p>
          <p className="text-xl">{characters}</p>
        </div>
        <div>
          <p className="text-lg">Weak Words</p>
          <p className="text-xl">{weakWords}</p>
        </div>
      </div>

      <div className="flex justify-center flex-wrap gap-4 text-sm mt-20">
        <button onClick={onRestart} className="px-4 py-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500">⟲ Restart</button>
        <button className="px-4 py-2 bg-yellow-600 rounded-full cursor-pointer hover:bg-yellow-500">⚠ Mistyped</button>
        <button className="px-4 py-2 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-500">📄 Certificate</button>
        <button className="px-4 py-2 bg-green-600 rounded-full cursor-pointer hover:bg-green-500">Next ⟶</button>
      </div>
    </div>
  );
}
