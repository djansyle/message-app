import mongoose, { Document } from 'mongoose';

export interface Channel {
  _id: string;
  owner: string;
  name: string;
}

const ChannelSchema = new mongoose.Schema({
  _id: {
    required: true,
    type: String,
  },
  owner: {
    required: true,
    type: String,
  },
  name: {
    required: true,
    type: String,
  },
  dateTimeCreated: {
    type: Date,
    default: () => new Date(),
  },
});

export default mongoose.model<Channel & Document>('Channel', ChannelSchema);
