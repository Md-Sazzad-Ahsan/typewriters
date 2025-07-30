// models/TypingResult.js
import mongoose from 'mongoose';

const TypingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: false,
    },
    wpm: {
      type: Number,
      required: true,
      index: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      enum: ['English', 'Bangla', 'Code'],
      required: true,
      index: true,
    },
    modeType: {
      type: String,
      enum: ['Time', 'Words', 'Quote', 'Custom'],
      index: true,
    },
    quoteSize: {
      type: String,
      enum: ['short', 'medium', 'long'],
    },
    timeLimit: {
      type: Number,
    },
    wordLimit: {
      type: Number,
    },
    wordsMode: {
      punctuation: { type: Boolean, default: false },
      numbers: { type: Boolean, default: false },
      capitals: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true, // adds createdAt automatically
  }
);

export default mongoose.models.TypingHistory ||
  mongoose.model('TypingHistory', TypingHistorySchema);
