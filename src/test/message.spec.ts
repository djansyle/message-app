import R from 'ramda';

import {
  chance,
  authenticateUser,
  createChannel,
  addChannelMember,
  sendMessage,
  listMessages,
} from './helper';

describe('Message', function () {
  describe('Mutation#sendMessage', function () {
    it('SHOULD be able to send a message', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await authenticateUser();

      await addChannelMember({ accessToken, channelId, userId: member.id });

      let { response, error } = await sendMessage({
        accessToken,
        channelId,
        text: chance.sentence(),
      });
      expect(error).toBeNull();
      expect(response.data.sendMessage).toBe(true);

      ({ response, error } = await sendMessage({
        accessToken: member.accessToken,
        channelId,
        text: chance.sentence(),
      }));
      expect(error).toBeNull();
      expect(response.data.sendMessage).toBe(true);
    });

    it('SHOULD return UNAUTHORIZED error WHEN not a member or an owner of the channel', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await authenticateUser();

      const { response, error } = await sendMessage({
        accessToken: member.accessToken,
        channelId,
        text: chance.sentence(),
      });
      expect(error).toBeDefined();
      expect(R.path(['graphQLErrors', 0, 'code'], error)).toBe('UNAUTHORIZED');

      expect(response).toBeUndefined();
    });
  });

  describe('Query#message', function () {
    it('SHOULD be able to retrieve messages in descending order', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });

      const messages = R.times(() => chance.word(), 10);
      for (const text of messages) {
        await sendMessage({ accessToken, channelId, text });
      }

      const { response, error } = await listMessages({
        accessToken,
        channelId,
      });
      expect(error).toBeNull();

      const receivedMessages = response.data.messages.edges.map(
        R.path(['node', 'text']),
      );
      expect(response.data.messages.edges).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({
            __typename: 'MessageEdge',
            node: expect.objectContaining({
              __typename: 'Message',
              id: expect.any(String),
              text: expect.any(String),
              user: expect.objectContaining({
                __typename: 'User',
                id: expect.any(String),
                email: expect.any(String),
              }),
              channel: expect.objectContaining({
                __typename: 'Channel',
                id: expect.any(String),
                name: expect.any(String),
              }),
              dateTimeCreated: expect.any(String),
            }),
          }),
        ]),
      );
      expect(receivedMessages).toEqual(messages.reverse());
    });

    it('SHOULD be able to receive messages WHEN user is a member of the channel', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await authenticateUser();

      await addChannelMember({ accessToken, channelId, userId: member.id });
      await Promise.all(
        R.times(
          () =>
            sendMessage({ accessToken, channelId, text: chance.sentence() }),
          10,
        ),
      );

      const { response, error } = await listMessages({
        accessToken: member.accessToken,
        channelId,
      });
      expect(error).toBeNull();
      expect(response.data.messages.edges.length).toBe(10);
    });

    it('SHOULD be able to retrieve messages GIVEN first and after parameter', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });

      await Promise.all(
        R.times(
          () =>
            sendMessage({ accessToken, channelId, text: chance.sentence() }),
          10,
        ),
      );

      let { response, error } = await listMessages({
        accessToken,
        channelId,
        first: 2,
      });
      expect(error).toBeNull();
      expect(response.data.messages.edges.length).toBe(2);

      ({ response, error } = await listMessages({
        accessToken,
        channelId,
        first: 20,
        after: response.data.messages.edges[1].cursor,
      }));
      expect(error).toBeNull();
      expect(response.data.messages.edges.length).toBe(8);
    });

    it('SHOULD return a NOT_CHANNEL_MEMBER error WHEN the sender is not a member', async function () {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });

      await Promise.all(
        R.times(
          () =>
            sendMessage({ accessToken, channelId, text: chance.sentence() }),
          10,
        ),
      );

      const { accessToken: accessToken2 } = await authenticateUser();
      const { response, error } = await listMessages({
        accessToken: accessToken2,
        channelId,
      });
      expect(response).toBeUndefined();
      expect(error).toBeDefined();
      expect(R.path(['graphQLErrors', 0, 'code'], error)).toBe(
        'NOT_CHANNEL_MEMBER',
      );
    });

    it('SHOULD return a CHANNEL_NOT_FOUND error WHEN channel does not exists', async function () {
      const { accessToken } = await authenticateUser();
      const channelId = chance.guid();

      const { response, error } = await listMessages({
        accessToken,
        channelId,
      });
      expect(response).toBeUndefined();
      expect(error).toBeDefined();
      expect(R.path(['graphQLErrors', 0, 'code'], error)).toBe(
        'CHANNEL_NOT_FOUND',
      );
    });
  });
});
