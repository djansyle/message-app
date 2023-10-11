import mongoose, { Document } from 'mongoose';

export interface User {
  _id: string;
  email: string;
  password: string;
  salt: string;
}

const UserSchema = new mongoose.Schema({
  _id: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  salt: {
    required: true,
    type: String,
  },
}).index({ email: 1 }, { unique: true });

export default mongoose.model<User & Document>('User', UserSchema);
