import { gql } from '@apollo/client';
import tryToCatch from 'try-to-catch';
import { path } from 'ramda';

import ChannelModel from '../models/channel';
import ChannelMemberModel from '../models/channel-member';

import { chance, createChannel, authenticateUser, addChannelMember, createUser } from './helper';

describe('Channel', function() {
  describe('Mutation#createChannel', function() {
    it('SHOULD be able to create a new channel', async function() {
      const { response, error } = await createChannel();
      expect(error).toBeNull();

      expect(response.data.createChannel).toBeDefined();
      expect(response.data.createChannel.id).toBeDefined();

      const channel = await ChannelModel.findById(response.data.createChannel.id);
      expect(channel).toBeDefined();
    });

    it('SHOULD not be able to create a channel name under same user', async function() {
      const { accessToken } = await authenticateUser();

      const name = chance.word();
      await createChannel({ accessToken, name });

      const { error } = await createChannel({ accessToken, name });
      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe('CHANNEL_ALREADY_EXISTS');
    });

    it('SHOULD be able to create same channel name with different user', async function() {
      const { accessToken } = await authenticateUser();

      const name = chance.word();
      await createChannel({ accessToken, name });

      const { accessToken: accessToken2 } = await authenticateUser();
      const { response, error } = await createChannel({ accessToken: accessToken2, name });
      expect(response.data.createChannel).toBeDefined();
      expect(error).toBeNull();
    });
  });

  describe('Mutation#addChannelMember', function() {
    it('SHOULD be able to add a new channel member', async function() {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await createUser();

      const { response, error } = await addChannelMember({ accessToken, channelId, userId: member.id });
      expect(error).toBeNull();

      expect(response.data.addChannelMember).toBe(true);

      const exists = await ChannelMemberModel.exists({ channelId, userId: member.id });
      expect(exists).toBeTruthy();
    });

    it('SHOULD return false WHEN adding a member that is already a member', async function() {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await createUser();

      await addChannelMember({ accessToken, channelId, userId: member.id });
      const { response, error } = await addChannelMember({ accessToken, channelId, userId: member.id });
      expect(error).toBeNull();

      expect(response.data.addChannelMember).toBe(false); 
    });

    it('SHOULD return an NOT_CHANNEL_OWNER error WHEN the invitee is not the channel owner', async function() {
      const { accessToken: channelOwnerToken } = await authenticateUser();
      const { accessToken: nonChannelOwnerToken } = await authenticateUser();

      const { channelId } = await createChannel({ accessToken: channelOwnerToken });
      const { error } = await addChannelMember({ accessToken: nonChannelOwnerToken, channelId, userId: chance.guid() });

      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe('NOT_CHANNEL_OWNER');
    });

    it('SHOULD return USER_NOT_FOUND error WHEN the user does not exists', async function() {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });

      const { response, error } = await addChannelMember({ accessToken, channelId, userId: chance.guid() });
      expect(response).toBeFalsy();
      
      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe('USER_NOT_FOUND');
    });
  });

  describe('Query#channels', function() {
    it('SHOULD be able to retrieve all the channels of the user', function() {
      
    });
  });
});
