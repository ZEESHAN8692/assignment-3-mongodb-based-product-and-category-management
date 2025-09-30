import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String },
  isVerified: { type: Boolean, default: false }, 
  timezone: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema);

