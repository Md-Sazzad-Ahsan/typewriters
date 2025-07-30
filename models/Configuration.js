import mongoose from 'mongoose';

const ConfigurationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // allow for localStorage-based anonymous config
      index: true,
    },

    language: {
      type: String,
      enum: ['English', 'Bangla','Hindi','German','Spanish','French','Arabic','Code'],
      default: 'English',
    },

    codeLanguage: {
      type: String,
      enum: ['C/C++', 'Python', 'Js', 'Flutter', 'Java', 'PHP'],
      default: 'C/C++',
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

    wordsMode: {
      punctuation: { type: Boolean, default: false },
      numbers: { type: Boolean, default: false },
      capitals: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate models on hot reload
export default mongoose.models.Configuration || mongoose.model('Configuration', ConfigurationSchema);
