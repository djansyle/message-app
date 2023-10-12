import { path } from 'ramda';

import { chance, authenticateUser, createChannel, addChannelMember, sendMessage } from './helper';

describe('Message', function() {
  describe('Mutation#sendMessage', function() {
    it('SHOULD be able to send a message', async function() {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await authenticateUser();

      await addChannelMember({ accessToken, channelId, userId: member.id });

      let { response, error } = await sendMessage({ accessToken, channelId, text: chance.sentence() });
      expect(error).toBeNull();
      expect(response.data.sendMessage).toBe(true);

      ({ response, error } = await sendMessage({ accessToken: member.accessToken, channelId, text: chance.sentence() }));
      expect(error).toBeNull();
      expect(response.data.sendMessage).toBe(true);
    });
    
    it('SHOULD return UNAUTHORIZED error WHEN not a member or an owner of the channel', async function() {
      const { accessToken } = await authenticateUser();
      const { channelId } = await createChannel({ accessToken });
      const member = await authenticateUser();

      const { response, error } = await sendMessage({ accessToken: member.accessToken, channelId, text: chance.sentence() });
      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe('UNAUTHORIZED');

      expect(response).toBeUndefined();
    });
  });
});