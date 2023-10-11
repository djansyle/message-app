import mongoose, { Document } from 'mongoose';
import ms from 'ms';

const ThirtyDays = Math.floor(ms('30d') / 1000);

export interface User extends Document {
  _id: string;
  revoked: boolean;
}

const TokenSchema = new mongoose.Schema({
  _id: {
    required: true,
    type: String,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    expires: ThirtyDays,
  },
});

export default mongoose.model<User>('Token', TokenSchema);
