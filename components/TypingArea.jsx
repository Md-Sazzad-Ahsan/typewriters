import React, { useEffect, useRef, useState } from "react";

export default function TypingArea({ text, typedText, errors }) {
  const containerRef = useRef(null);
  const activeCharRef = useRef(null);
  const [startTime] = useState(Date.now());
  const [typeResult, setTypeResult] = useState([]);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  // Initialize session - clear previous results when starting new session
  useEffect(() => {
    localStorage.removeItem("typeResult");
    setTypeResult([]);
  }, []);

  // Auto-scroll logic (unchanged)
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const charElement = activeCharRef.current;
      const containerElement = containerRef.current;

      const charTop = charElement.offsetTop;
      const containerScrollTop = containerElement.scrollTop;
      const containerHeight = containerElement.clientHeight;
      const lineHeight = charElement.offsetHeight;

      if (charTop > containerScrollTop + lineHeight) {
        const desiredScrollTop = charTop - lineHeight;
        containerElement.scrollTo({
          top: desiredScrollTop,
          behavior: "smooth",
        });
      }
    }
  }, [typedText]);

  // Track when user starts typing
  useEffect(() => {
    if (typedText.length > 0 && !hasStartedTyping) {
      setHasStartedTyping(true);
    }
  }, [typedText, hasStartedTyping]);

  // Function to store current data
  const storeCurrentData = () => {
    if (!hasStartedTyping || typedText.length === 0) return;

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    if (elapsedTime === 0) return;

    const correctChars = typedText
      .split("")
      .filter((char, i) => char === text[i]).length;

    const totalChars = typedText.length;
    const wpm = ((correctChars / 5) / (elapsedTime / 60)).toFixed(2);
    const rawWPM = ((totalChars / 5) / (elapsedTime / 60)).toFixed(2);
    const accuracy = totalChars === 0
      ? 100
      : ((correctChars / totalChars) * 100).toFixed(2);

    const newData = {
      time: elapsedTime,
      wpm: Number(wpm),
      rawWPM: Number(rawWPM),
      accuracy: Number(accuracy),
      characters: totalChars,
    };

    setTypeResult((prev) => {
      // Prevent duplicate entries for the same time
      const filtered = prev.filter(item => item.time !== elapsedTime);
      const updated = [...filtered, newData];
      localStorage.setItem("typeResult", JSON.stringify(updated));
      return updated;
    });
  };

  // WPM, rawWPM, accuracy calculation every second
  useEffect(() => {
    if (!hasStartedTyping) return;

    const interval = setInterval(() => {
      storeCurrentData();
    }, 1000);

    return () => {
      clearInterval(interval);
      // Store final data when component unmounts
      storeCurrentData();
    };
  }, [typedText, text, startTime, hasStartedTyping]);

  return (
    <div
      ref={containerRef}
      className="text-3xl font-mono leading-relaxed text-gray-300 relative h-48 overflow-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      {text.split("").map((char, index) => {
        let charClass = "";
        const isTyped = index < typedText.length;
        const isCurrent = index === typedText.length;
        const isError = errors[index] && typedText[index] !== text[index];

        if (isTyped) {
          charClass = isError ? "text-red-500" : "text-green-400";
        } else if (isCurrent) {
          charClass = "text-blue-400 underline decoration-2 decoration-blue-400";
          if (typedText[index] && typedText[index] !== text[index]) {
            charClass = "text-red-500 bg-red-900 bg-opacity-50 rounded-sm";
          }
        }

        return (
          <span
            key={index}
            ref={isCurrent ? activeCharRef : null}
            className={charClass}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}
