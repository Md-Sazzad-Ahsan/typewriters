import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
