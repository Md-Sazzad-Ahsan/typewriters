/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Generates a list of random words from the provided word list
 * @param {string[]} wordList - The source list of words
 * @param {number} count - Number of words to generate
 * @param {boolean} [allowDuplicates=true] - Whether to allow duplicate words if needed
 * @returns {string[]} Array of randomly selected words
 */
export function generateRandomWords(wordList, count, allowDuplicates = true) {
  if (!wordList || !wordList.length) {
    console.warn('Empty or invalid word list provided');
    return [];
  }

  // Ensure count is a positive number
  count = Math.max(1, Math.floor(count));
  
  // If we need more unique words than available and duplicates aren't allowed, adjust count
  if (!allowDuplicates && count > wordList.length) {
    console.warn(`Requested ${count} unique words but only ${wordList.length} available`);
    count = wordList.length;
  }

  // Separate words into short (2-5 chars) and other lengths
  const shortWords = wordList.filter(word => word.length >= 2 && word.length <= 5);
  const otherWords = wordList.filter(word => word.length < 2 || word.length > 5);
  
  // Calculate how many short words we want (40-50% of total)
  const shortWordCount = Math.min(
    Math.ceil(count * (0.4 + Math.random() * 0.1)), // 40-50% of words
    shortWords.length,                               // But not more than available short words
    count                                           // And not more than total words needed
  );
  
  // Get remaining words from other lengths
  const remainingCount = count - shortWordCount;
  
  // Shuffle both arrays
  const shuffledShortWords = shuffleArray([...shortWords]);
  const shuffledOtherWords = shuffleArray([...otherWords]);
  
  // Combine the words (short words first, then others)
  const combinedWords = [
    ...shuffledShortWords.slice(0, shortWordCount),
    ...shuffledOtherWords.slice(0, remainingCount)
  ];
  
  // Final shuffle to mix short and long words
  const sourceList = shuffleArray(combinedWords);
  
  // Shuffle the word list
  const shuffledWords = shuffleArray([...sourceList]);
  
  // If we can get enough unique words without duplicates
  if (count <= shuffledWords.length || !allowDuplicates) {
    return shuffledWords.slice(0, count);
  }
  
  // If we need to allow duplicates
  const result = [];
  while (result.length < count) {
    const remaining = count - result.length;
    const take = Math.min(remaining, shuffledWords.length);
    result.push(...shuffledWords.slice(0, take));
    
    // Reshuffle for additional randomness when we need to loop
    if (result.length < count) {
      shuffleArray(shuffledWords);
    }
  }
  
  // Final shuffle to ensure randomness in the order
  return shuffleArray(result);
}

/**
 * Generates text with the specified number of words from the word list
 * @param {string[]} wordList - The source list of words
 * @param {number} wordCount - Number of words to generate
 * @returns {string} Generated text with the specified number of words
 */
export function generateText(wordList, wordCount) {
  const words = generateRandomWords(wordList, wordCount);
  return words.join(' ');
}

/**
 * Gets the appropriate word count based on the current settings
 * @param {Object} settings - Current typing settings
 * @returns {number} The target word count
 */
export function getTargetWordCount(settings) {
  if (settings.modeType === 'Words') {
    // For Words mode, return the exact word limit specified
    const count = parseInt(settings.wordLimit);
    return isNaN(count) || count < 1 ? 50 : count;
  } else if (settings.modeType === 'Time') {
    // For Time mode, estimate words needed based on time limit
    const timeLimit = parseInt(settings.timeLimit) || 30;
    const estimatedWPM = 40;
    return Math.max(30, Math.ceil((estimatedWPM * timeLimit) / 60));
  } else if (settings.modeType === 'Quote') {
    // For Quote mode, use a reasonable default
    return 30;
  }
  return 50; // Default word count
}
