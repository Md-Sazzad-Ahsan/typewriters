'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Area,
  CartesianGrid,
} from 'recharts';

export default function TypingResultChart() {
  // Get the latest typing progress data from localStorage
  const typingProgress = JSON.parse(localStorage.getItem('typing_progress') || '[]');
  
  // Get the most recent entry
  const latestEntry = typingProgress.length > 0 ? typingProgress[typingProgress.length - 1] : null;
  
  if (!latestEntry) return null;

  // Determine if the test was time-based or word-based
  const isTimeBased = latestEntry.mode === 'Time';
  const total = isTimeBased ? (latestEntry.duration ? parseInt(latestEntry.duration) : 30) : latestEntry.wordsTyped;
  
  // Create a result object similar to what was previously passed as props
  const result = {
    wpm: latestEntry.wpm,
    rawWPM: latestEntry.rawWPM,
    accuracy: latestEntry.accuracy,
    time: isTimeBased ? parseInt(latestEntry.elapsedTime) : null,
    words: !isTimeBased ? latestEntry.wordsTyped : null,
    errors: latestEntry.errors,
    testData: typingProgress
      .filter((entry, index, self) => 
        index === self.findIndex(e => 
          (isTimeBased ? Math.min(Math.floor(parseFloat(e.elapsedTime)), total) : e.wordsTyped) === 
          (isTimeBased ? Math.min(Math.floor(parseFloat(entry.elapsedTime)), total) : entry.wordsTyped)
        )
      )
      .sort((a, b) => {
        if (isTimeBased) {
          return parseFloat(a.elapsedTime) - parseFloat(b.elapsedTime);
        } else {
          return (a.wordsTyped || 0) - (b.wordsTyped || 0);
        }
      })
      .map(entry => ({
        time: isTimeBased ? Math.min(Math.floor(parseFloat(entry.elapsedTime)), total) : null,
        words: !isTimeBased ? entry.wordsTyped : null,
        wpm: entry.wpm,
        rawWPM: entry.rawWPM,
        accuracy: entry.accuracy,
      }))
      .filter(entry => !isTimeBased || (entry.time !== null && entry.time <= total))
  };
  
  // Debug: Log the testData to see what we have
  console.log('TestData:', result.testData);
  console.log('TestData length:', result.testData.length);

  // Determine number of steps based on total
  let steps = 1;
  if (total <= 25) {
    steps = 1;
  } else if (total <= 50) {
    steps = 2;
  } else {
    steps = 5;
  }
  
  // For word-based tests, we want to show all words if we don't have specific data points
  if (!isTimeBased && (!result.testData || result.testData.length === 0)) {
    steps = result.words || 1;
  }

  // Generate chart data
  const generateChartData = () => {
    console.log('Generating chart data, testData available:', result.testData && result.testData.length > 0);
    // Always use testData if available
    if (result.testData && result.testData.length > 0) {
      console.log('Using testData for chart generation');
      // Deduplicate data points by time/word value and limit to actual test duration
      const uniqueDataPoints = result.testData
        .filter((point, index, self) => 
          index === self.findIndex(p => 
            (isTimeBased ? p.time : p.words) === 
            (isTimeBased ? point.time : point.words)
          )
        )
        .filter(point => !isTimeBased || (point.time !== null && point.time <= total))
        .sort((a, b) => {
          if (isTimeBased) {
            return (a.time || 0) - (b.time || 0);
          } else {
            return (a.words || 0) - (b.words || 0);
          }
        });
      
      return uniqueDataPoints.map((point) => ({
        name: isTimeBased
          ? `${point.time ?? 0}`
          : `${point.words ?? 0}`,
        wpm: point.wpm,
        rawWPM: point.rawWPM,
        accuracy: point.accuracy,
      }));
    }

    // For word-based tests without testData, show points for each word up to the target
    if (!isTimeBased && result.words) {
      console.log('Using word-based fallback logic');
      return Array.from({ length: result.words }, (_, i) => {
        const wordNumber = i + 1;
        return {
          name: `${wordNumber}`,
          wpm: result.wpm,
          rawWPM: result.rawWPM,
          accuracy: result.accuracy,
        };
      });
    }

    // For time-based tests, show points at regular intervals
    if (isTimeBased && total) {
      console.log('Using time-based fallback logic');
      // For short tests (≤ 10 seconds), show every second
      if (total <= 10) {
        return Array.from({ length: total }, (_, i) => {
          const second = i + 1;
          return {
            name: `${second}`,
            wpm: result.wpm,
            rawWPM: result.rawWPM,
            accuracy: result.accuracy,
          };
        });
      }
      
      // For longer tests, create data points at regular intervals
      const interval = Math.max(1, Math.floor(total / 10)); // Aim for about 10 data points
      const dataPointCount = Math.floor(total / interval) + 1;
      
      const dataPoints = [];
      for (let i = 0; i <= dataPointCount; i++) {
        const timePoint = i * interval;
        // Only include time points that are within the actual test duration
        if (timePoint > 0 && timePoint <= total) {
          dataPoints.push({
            name: `${timePoint}`,
            wpm: result.wpm,
            rawWPM: result.rawWPM,
            accuracy: result.accuracy,
          });
        }
      }
      
      // If we don't have enough data points, add the final point
      if (dataPoints.length === 0 || (dataPoints[dataPoints.length - 1].name !== `${total}`)) {
        dataPoints.push({
          name: `${total}`,
          wpm: result.wpm,
          rawWPM: result.rawWPM,
          accuracy: result.accuracy,
        });
      }
      
      return dataPoints;
    }

    const stepSize = Math.floor(total / steps) || 1;

    return Array.from({ length: steps }, (_, i) => {
      const value = (i + 1) * stepSize;
      return {
        name: `${value}`,
        wpm: result.wpm,
        rawWPM: result.rawWPM,
        accuracy: result.accuracy,
      };
    });
  };

  const data = generateChartData();

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{
              value: isTimeBased
                ? `Duration (${total}s)`
                : `Words (${result.words || latestEntry.wordsTyped})`,
              position: 'insideBottom',
              offset: -5,
            }}
          />
          <YAxis
            yAxisId="left"
            domain={[0, Math.max((result.rawWPM || 0) + 10, 100)]}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 120]}
            tickCount={12}
            tickFormatter={(v) => `${v}%`}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value, name) =>
              name === 'Accuracy'
                ? [`${parseFloat(value).toFixed(1)}%`, name]
                : [value, name]
            }
            labelFormatter={(label) => `Time/Words: ${label}`}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="rawWPM"
            name="Raw WPM"
            fill="rgba(137, 152, 245, 0.4)"
            stroke="#8884d8"
            strokeWidth={2}
            dot={data.length < 10}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="wpm"
            name="WPM"
            stroke="#2c2c90"
            strokeWidth={2}
            dot={data.length < 10}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accuracy"
            name="Accuracy"
            stroke="#ff7300"
            strokeWidth={2}
            dot={data.length < 10}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
