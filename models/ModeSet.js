// models/ModeSet.js

import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

// Local storage key
const MODE_SET_STORAGE_KEY = 'modeSet';

// Default ModeSet values
const defaultModeSet = {
  language: 'English',
  codeLanguage: null,
  modeType: 'Time',
  quoteSize: 'medium',
  timeLimit: 60,
  wordLimit: 50,
  testModes: {
    punctuation: false,
    numbers: false,
    capitals: false,
  }
};

// Save ModeSet to localStorage
export const saveModeSetToStorage = (modeSet) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MODE_SET_STORAGE_KEY, JSON.stringify(modeSet));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Load ModeSet from localStorage
export const loadModeSetFromStorage = () => {
  if (typeof window === 'undefined') return defaultModeSet;
  
  try {
    const stored = localStorage.getItem(MODE_SET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultModeSet;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultModeSet;
  }
};

const modeSetSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: false, // optional to allow guests
  },
  language: {
    type: String,
    enum: ['English', 'Bangla','Hindi','German','Spanish','French','Arabic','Code'],
    default: 'English',
  },
  codeLanguage: {
    type: String,
    enum: ['C/C++', 'Python', 'Js', 'Flutter', 'Java', 'PHP'],
    default: null,
  },
  modeType: {
    type: String,
    enum: ['Time', 'Words', 'Quote', 'Custom'],
    default: 'Time',
  },
  quoteSize: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium',
  },
  timeLimit: {
    type: Number,
    default: 60,
  },
  wordLimit: {
    type: Number,
    default: 50,
  },
  testModes: {
    punctuation: { type: Boolean, default: false },
    numbers: { type: Boolean, default: false },
    capitals: { type: Boolean, default: false },
  },
},
{
  timestamps: true,
});

// Check if model exists before exporting
const ModeSet = models?.ModeSet || model('ModeSet', modeSetSchema);

export default ModeSet;
