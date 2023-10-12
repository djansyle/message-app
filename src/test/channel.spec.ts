import R from 'ramda';

import ChannelModel from '../models/channel';
import ChannelMemberModel from '../models/channel-member';

import {
  chance,
  createChannel,
  client,
  authenticateUser,
  addChannelMember,
  createUser,
  listChannels,
  listChannelMembers,
} from './helper';

describe('Channel', function () {
  describe('Mutation#createChannel', function () {
    it('SHOULD be able to create a new channel', async function () {
      const { response, error } = await createChannel();
      expect(error).toBeNull();

      expect(response.data.createChannel).toBeDefined();
      expect(response.data.createChannel.id).toBeDefined();

      const channel = await ChannelModel.findById(
        response.data.createChannel.id,
      );
      expect(channel).toBeDefined();
    });

    it('SHOULD not be able to create a channel name under same user', async function () {
      const { accessToken } = await authenticateUser();

      const name = chance.word();
      await createChannel({ accessToken, name });

      const { error } = await createChannel({ accessToken, name });
      expect(error).toBeDefined();
      expect(R.path(['graphQLErrors', 0, 'code'], error)).toBe(
        'CHANNEL_ALREADY_EXISTS',
      );
    });

    it('SHOULD be able to create same channel name with different user', async function () {
      const { accessToken } = await authenticateUser();

      const name = chance.word();
      await createChannel({ accessToken, name });

      const { accessToken: accessToken2 } = await authenticateUser();
      const { response, error } = await createChannel({
        accessToken: accessToken2,
        name,
      });
      expect(response.data.createChannel).toBeDefined();
      expect(error).toBeNull();
    });
  });

  describe('Mutation#addChannelMember', function () {
    it('SHOULD be able to add a new channel member', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await createUser();

      const { response, error } = await addChannelMember({
        accessToken,
        channelId,
        userId: member.id,
      });
      expect(error).toBeNull();

      expect(response.data.addChannelMember).toBe(true);

      const exists = await ChannelMemberModel.exists({
        channelId,
        userId: member.id,
      });
      expect(exists).toBeTruthy();
    });

    it('SHOULD return false WHEN adding a member that is already a member', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await createUser();

      await addChannelMember({ accessToken, channelId, userId: member.id });
      const { response, error } = await addChannelMember({
        accessToken,
        channelId,
        userId: member.id,
      });
      expect(error).toBeNull();

      expect(response.data.addChannelMember).toBe(false);
    });

    it('SHOULD return an NOT_CHANNEL_OWNER error WHEN the invitee is not the channel owner', async function () {
      const { accessToken: channelOwnerToken } = await authenticateUser();
      const { accessToken: nonChannelOwnerToken } = await authenticateUser();

      const { channelId } = await createChannel({
        accessToken: channelOwnerToken,
      });
      const { error } = await addChannelMember({
        accessToken: nonChannelOwnerToken,
        channelId,
        userId: chance.guid(),
      });

      expect(error).toBeDefined();
      expect(R.path(['graphQLErrors', 0, 'code'], error)).toBe(
        'NOT_CHANNEL_OWNER',
      );
    });

    it('SHOULD return USER_NOT_FOUND error WHEN the user does not exists', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });

      const { response, error } = await addChannelMember({
        accessToken,
        channelId,
        userId: chance.guid(),
      });
      expect(response).toBeFalsy();

      expect(error).toBeDefined();
      expect(R.path(['graphQLErrors', 0, 'code'], error)).toBe(
        'USER_NOT_FOUND',
      );
    });
  });

  describe('Query#channels', function () {
    it('SHOULD be able to retrieve all the channels of the user', async function () {
      const { accessToken: invitedUserToken, id } = await authenticateUser();
      const { channelId: ownedChannelId } = await createChannel({
        accessToken: invitedUserToken,
      });

      const { accessToken: inviteeUserToken } = await authenticateUser();
      const { channelId: invitedChannelId } = await createChannel({
        accessToken: inviteeUserToken,
      });

      await addChannelMember({
        accessToken: inviteeUserToken,
        channelId: invitedChannelId,
        userId: id,
      });

      const request = await client({
        authorization: `Bearer ${invitedUserToken}`,
      });

      const { response, error } = await listChannels({
        accessToken: invitedUserToken,
      });

      expect(error).toBeNull();

      expect(response.data.channels.edges).toHaveLength(2);
      const ownedChannelExists = response.data.channels.edges.find(
        ({ node }) => node.id === ownedChannelId,
      );
      expect(ownedChannelExists).toBeDefined();

      const invitedChannelExists = response.data.channels.edges.find(
        ({ node }) => node.id === invitedChannelId,
      );
      expect(invitedChannelExists).toBeDefined();
    });

    it('SHOULD be able to retrieve channels GIVEN first and after parameter', async function () {
      const { accessToken: invitedUserToken, id } = await authenticateUser();

      await Promise.all(
        R.times(
          () =>
            createChannel({
              accessToken: invitedUserToken,
            }),
          5,
        ),
      );

      // Add the invited user to the channel
      await Promise.all(
        R.times(async () => {
          const { channelId } = await createChannel({
            accessToken: invitedUserToken,
          });
          await addChannelMember({
            accessToken: invitedUserToken,
            channelId,
            userId: id,
          });
        }, 5),
      );

      const { response } = await listChannels({
        accessToken: invitedUserToken,
        first: 2,
      });

      expect(response.data.channels.pageInfo).toMatchObject(
        expect.objectContaining({
          __typename: 'PageInfo',
          total: 10,
          hasNext: true,
        }),
      );

      expect(response.data.channels.edges).toHaveLength(2);

      let nextCursor = response.data.channels.edges[1].cursor;
      const { response: response2 } = await listChannels({
        accessToken: invitedUserToken,
        first: 20,
        after: nextCursor,
      });

      // ensure that response2 does not have the same id from response
      const ids = response.data.channels.edges.map(({ node }) => node.id);
      const ids2 = response2.data.channels.edges.map(({ node }) => node.id);

      expect(R.intersection(ids, ids2)).toHaveLength(0);

      expect(response2.data.channels.pageInfo).toMatchObject(
        expect.objectContaining({
          __typename: 'PageInfo',
          total: 10,
          hasNext: false,
        }),
      );
    });
  });

  describe('Query#channelMembers', function () {
    it('SHOULD be able to list all the members of the channel', async function () {
      const { accessToken, id } = await authenticateUser();

      const { channelId } = await createChannel({ accessToken });
      const member = await createUser();

      await addChannelMember({
        accessToken,
        channelId,
        userId: member.id,
      });

      const { response, error } = await listChannelMembers({
        accessToken,
        channelId,
      });

      expect(error).toBeNull();
      expect(
        R.intersection(
          response.data.channelMembers.edges.map(R.path(['node', 'id'])),
          [id, member.id],
        ),
      ).toHaveLength(2);
    });

    it('SHOULD be able to retrieve channels GIVEN first and after parameter', async function () {
      const { accessToken } = await authenticateUser();

      const { channelId } = await createChannel({ accessToken });

      await Promise.all(
        R.times(async () => {
          const member = await createUser();

          await addChannelMember({
            accessToken,
            channelId,
            userId: member.id,
          });
        }, 10)
      );
      
      const { response } = await listChannelMembers({
        accessToken,
        channelId,
        first: 2,
      });

      expect(response.data.channelMembers.pageInfo).toMatchObject(
        expect.objectContaining({
          __typename: 'PageInfo',
          total: 11,
          hasNext: true,
        }),
      );

      expect(response.data.channelMembers.edges).toHaveLength(2);

      let nextCursor = response.data.channelMembers.edges[1].cursor;
      const { response: response2 } = await listChannelMembers({
        accessToken,
        channelId,
        first: 20,
        after: nextCursor,
      });

      // ensure that response2 does not have the same id from response
      const ids = response.data.channelMembers.edges.map(({ node }) => node.id);
      const ids2 = response2.data.channelMembers.edges.map(({ node }) => node.id);
      
      expect(R.intersection(ids, ids2)).toHaveLength(0);

      expect(response2.data.channelMembers.pageInfo).toMatchObject(
        expect.objectContaining({
          __typename: 'PageInfo',
          total: 11,
          hasNext: false,
        }),
      );
    });
  });
});
