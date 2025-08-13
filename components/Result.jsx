"use client";

import React, { useState, useEffect } from "react";
import { loadModeSetFromStorage } from "@/models/ModeSet";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  CartesianGrid,
} from "recharts";

export default function Result({ onRestart }) {
  const [data, setData] = useState([]);
  const [result, setResult] = useState({
    wpm: 0,
    rawWPM: 0,
    accuracy: 0,
    characters: 0,
    time: 0,
  });

  useEffect(() => {
    const readAndApply = () => {
      try {
        const storedData = localStorage.getItem("typeResult");
        if (!storedData) return;
        const raw = JSON.parse(storedData);

        // Sanitize: coerce numbers, filter invalid, dedupe by time, sort ascending
        const numeric = Array.isArray(raw)
          ? raw
              .map((d) => ({
                time: Number(d?.time),
                wpm: Number(d?.wpm),
                rawWPM: Number(d?.rawWPM),
                accuracy: Number(d?.accuracy),
                characters: Number(d?.characters),
              }))
              .filter(
                (d) =>
                  Number.isFinite(d.time) &&
                  d.time >= 0 &&
                  Number.isFinite(d.wpm) &&
                  Number.isFinite(d.rawWPM) &&
                  Number.isFinite(d.accuracy) &&
                  Number.isFinite(d.characters)
              )
          : [];

        const byTime = new Map();
        for (const d of numeric) {
          // Keep the last entry for each second
          byTime.set(d.time, d);
        }
        const cleaned = Array.from(byTime.values()).sort((a, b) => a.time - b.time);

        if (cleaned.length === 0) return;

        // Normalize/cap final time for Time mode using stored typing settings
        const modeSet = loadModeSetFromStorage();
        const last = cleaned[cleaned.length - 1];
        let finalTime = last.time;
        if (modeSet?.modeType === "Time" && Number.isFinite(modeSet?.timeLimit)) {
          // Cap at timeLimit to avoid off-by-one from async cleanup
          finalTime = Math.min(finalTime, Number(modeSet.timeLimit));
        }

        setData(cleaned);
        setResult({
          wpm: last.wpm,
          rawWPM: last.rawWPM,
          accuracy: last.accuracy,
          characters: last.characters,
          time: finalTime,
        });
      } catch (error) {
        console.error("Error reading typing results from localStorage:", error);
      }
    };

    // Initial read
    readAndApply();
    // Re-read shortly after mount to catch TypingArea's unmount write
    const t = setTimeout(readAndApply, 120);

    // Also listen for storage updates (in case future flows write after mount)
    const onStorage = (e) => {
      if (e.key === "typeResult") readAndApply();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearTimeout(t);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Handle Tab key press to restart the test
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (onRestart) {
          onRestart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRestart]);

  // Show fallback UI when no typing data is available
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="text-center">
          <p className="text-xl mb-2">No typing data available</p>
          <p className="text-sm">Complete a typing test to see your results here</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "95%", height: 370 }}>
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 10, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" yAxisId="left" />
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(121, 134, 134, 0.4)"
            yAxisId="right"
          />
          <XAxis
            dataKey="time"
            label={{
              value: "Time (seconds)",
              position: "insideBottom",
              offset: -10,
            }}
            allowDecimals={false}
            ticks={(() => {
              const total = data.length;
              const step =
                total <= 30
                  ? 1
                  : total <= 60
                  ? 2
                  : total <= 120
                  ? 3
                  : total <= 180
                  ? 4
                  : 5;

              return data.map((d) => d.time).filter((t) => t % step === 0);
            })()}
          />

          <YAxis
            yAxisId="left"
            domain={[0, "auto"]}
            allowDecimals={false}
            label={{
              value: "Words Per Minute",
              angle: -90,
              position: "insideLeft",
              offset: 20,
              style: { textAnchor: "middle", fill: "#00A362", fontSize: 12 },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickCount={12}
            tickFormatter={(v) => `${v}%`}
            allowDecimals={false}
            label={{
              value: "Accuracy",
              angle: 90,
              position: "insideRight",
              offset: 5,
              style: { textAnchor: "middle", fill: "#FF692A", fontSize: 12 },
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "Accuracy") {
                return [`${parseFloat(value).toFixed(1)}%`, name];
              } else if (name === "WPM" || name === "Raw WPM") {
                return [Math.round(parseFloat(value)), name];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `Time: ${label}s`}
            contentStyle={{
              backgroundColor: "#333", // dark background
              borderColor: "#555",
              color: "#eee", // light text color
              fontWeight: "bold",
            }}
            labelStyle={{ color: "#eee" }}
          />
          <Legend
            verticalAlign="top"
            height={40}
            formatter={(value, entry) => {
              const stats = {
                WPM: Math.round(result.wpm).toString(),
                "Raw WPM": Math.round(result.rawWPM).toString(),
                Accuracy: `${result.accuracy}%`,
              };

              return (
                <span
                  className="font-bold text-3xl"
                  style={{ color: entry.color }}
                >
                  {value}: {stats[value] ?? ""}
                </span>
              );
            }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="wpm"
            name="WPM"
            stroke="#00A362"
            strokeWidth={2}
            dot={data.length < 10}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="rawWPM"
            name="Raw WPM"
            // fill="rgba(137, 152, 245, 0.4)"
            stroke="#0066FF"
            strokeWidth={1}
            dot={data.length < 10}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accuracy"
            name="Accuracy"
            stroke="#FF692A"
            strokeWidth={1}
            dot={data.length < 10}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
