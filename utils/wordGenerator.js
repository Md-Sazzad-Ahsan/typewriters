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

  const result = [];
  const usedIndices = new Set();
  
  // First pass: try to get unique words
  while (result.length < count && usedIndices.size < wordList.length) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      result.push(wordList[randomIndex]);
    }
  }

  // If we still need more words and duplicates are allowed
  if (result.length < count && allowDuplicates) {
    const remaining = count - result.length;
    for (let i = 0; i < remaining; i++) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      result.push(wordList[randomIndex]);
    }
  }

  return result;
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
  if (settings.typingCount === 'Words') {
    const count = parseInt(settings.typingOption);
    return isNaN(count) || count < 1 ? 50 : count;
  } else if (settings.typingCount === 'Time') {
    const timeLimit = parseInt(settings.typingOption) || 30;
    const estimatedWPM = 40;
    return Math.max(30, Math.ceil((estimatedWPM * timeLimit) / 60));
  } else if (settings.typingCount === 'Quote') {
    return 30; // Default for quotes
  }
  return 50; // Default word count
}
