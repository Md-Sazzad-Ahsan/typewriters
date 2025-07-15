// utils/helpers.js

export function calculateWPM(correctCharacters, startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const timeInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  if (timeInMinutes <= 0) return 0;
  return (correctCharacters / 5) / timeInMinutes;
}

export function calculateAccuracy(correctCharacters, totalCharactersTyped) {
  if (totalCharactersTyped === 0) return 100;
  return (correctCharacters / totalCharactersTyped) * 100;
}