"use client";

import React, { useState, useEffect } from "react";
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

export default function TypingResultChart() {
  const [data, setData] = useState([]);
  const [result, setResult] = useState({
    wpm: 0,
    rawWPM: 0,
    accuracy: 0,
    characters: 0,
    time: 0,
  });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("typeResult");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        
        // Calculate overall statistics from the last entry
        if (parsedData.length > 0) {
          const lastEntry = parsedData[parsedData.length - 1];
          setResult({
            wpm: lastEntry.wpm,
            rawWPM: lastEntry.rawWPM,
            accuracy: lastEntry.accuracy,
            characters: lastEntry.characters,
            time: lastEntry.time,
          });
        }
      }
    } catch (error) {
      console.error("Error reading typing results from localStorage:", error);
    }
  }, []);

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
            formatter={(value, name) =>
              name === "Accuracy"
                ? [`${parseFloat(value).toFixed(1)}%`, name]
                : [value, name]
            }
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
                WPM: `${result.wpm}`,
                "Raw WPM": `${result.rawWPM}`,
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
