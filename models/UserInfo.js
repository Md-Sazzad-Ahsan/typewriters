import mongoose from 'mongoose';

const UserInfoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    certificate: {
      type: String,
      default: '',
      index: true,
      trim: true,
      unique: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserInfo || mongoose.model('UserInfo', UserInfoSchema);
