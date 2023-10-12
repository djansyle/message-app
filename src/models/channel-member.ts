import mongoose, { Document } from 'mongoose';

export interface ChannelMember {
  _id: string;
  channelId: string;
  userId: string;
  dateTimeJoined: Date;
}

const ChannelMemberSchema = new mongoose.Schema({
  _id: {
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
  dateTimeJoined: {
    type: Date,
    default: () => new Date(),
  },
});

export default mongoose.model<ChannelMember & Document>(
  'ChannelMember',
  ChannelMemberSchema,
);
