import { gql } from '@apollo/client';
import tryToCatch from 'try-to-catch';
import { path } from 'ramda';

import ChannelModel from '../models/channel';
import { client, chance, createUser, authenticateUser } from './helper';

describe('Channel', function() {
  describe('Mutation#createChannel', function() {
    it('SHOULD be able to create a new channel', async function() {
      const { accessToken } = await authenticateUser();
      const request = await client({
        authorization: `Bearer ${accessToken}`,
      });

      const mutation = gql`
        mutation CreateChannel($name: String!) {
          createChannel(name: $name) {
            id
            name
          }
        }
      `;

      const channelName = chance.word();
      const response = await request.mutate({
        mutation,
        variables: {
          name: channelName,
        },
      });

      expect(response.data.createChannel).toBeDefined();
      expect(response.data.createChannel.id).toBeDefined();

      const channel = await ChannelModel.findById(response.data.createChannel.id);
      expect(channel).toBeDefined();
    });

    it('SHOULD not be able to create a channel with the same user', async function() {
      const { accessToken } = await authenticateUser();
      const request = await client({
        authorization: `Bearer ${accessToken}`,
      });

      const mutation = gql`
        mutation CreateChannel($name: String!) {
          createChannel(name: $name) {
            id
            name
          }
        }
      `;

      const channelName = chance.word();
      await request.mutate({
        mutation,
        variables: {
          name: channelName,
        },
      });

      const [error] = await tryToCatch(request.mutate, {
        mutation,
        variables: {
          name: channelName,
        },
      });

      expect(error).toBeDefined();
      expect(path(['graphQLErrors', 0, 'code'], error)).toBe('CHANNEL_ALREADY_EXISTS');
      
    });

    it('SHOULD be able to create same channel name with different user', async function() {
      
    });
  });
});