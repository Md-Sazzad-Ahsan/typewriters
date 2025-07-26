// utils/words.js
const commonEnglishWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "person", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
];

export function generateWords({
  mode = '',
  code = '',
  lang = '',
  count = 50,
  random = true
}) {
  let words = commonEnglishWords;

  // Apply mode filters
  if (mode === '@Punctuation') {
    words = words.filter(word => /[.,!?]/.test(word));
  } else if (mode === '#Number') {
    words = words.filter(word => /\d/.test(word));
  }

  // Apply coding language filters
  if (code === 'C/C++') {
    words = words.filter(word => 
      ['int', 'void', 'char', 'float', 'double', 'if', 'else', 'for', 'while'].includes(word)
    );
  } else if (code === 'Python') {
    words = words.filter(word => 
      ['def', 'class', 'import', 'from', 'as', 'try', 'except'].includes(word)
    );
  } else if (code === 'JS') {
    words = words.filter(word => 
      ['function', 'var', 'let', 'const', 'class', 'import', 'export'].includes(word)
    );
  }

  // Take the first 'count' words
  words = words.slice(0, count);

  // If random is true, shuffle the words
  if (random) {
    words.sort(() => Math.random() - 0.5);
  }

  return words.join(' ');
}

export function generatePunctuationTest(count = 50) {
    const punctuationChars = ".,?!:;\"'-()";
    let text = "";
    for (let i = 0; i < count; i++) {
        text += commonEnglishWords[Math.floor(Math.random() * commonEnglishWords.length)];
        text += punctuationChars[Math.floor(Math.random() * punctuationChars.length)];
        text += " ";
    }
    return text.trim();
}