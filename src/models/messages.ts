import mongoose, { Document } from 'mongoose';

export interface Message {
  _id: string;
  text: string;
  userId: string;
  timestamp: Date;
}

const MessageSchema = new mongoose.Schema({
  _id: {
    required: true,
    type: String,
  },
  text: {
    required: true,
    type: String,
  },
  channelId: {
    required: true,
    type: String,
  },
  userId: {
    required: true,
    type: String,
  },
  dateTimeCreated: {
    type: Date,
    default: () => new Date(),
  },
});

export default mongoose.model<Message & Document>('Message', MessageSchema);
