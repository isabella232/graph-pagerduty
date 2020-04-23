import { createMockExecutionContext } from '@jupiterone/integration-sdk/testing';
import { mocked } from 'ts-jest/utils';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = mocked(axios, true);

import validateInvocation, {
  authenticationFailedMessage,
} from '../validateInvocation';

beforeEach(() => {
  jest.resetAllMocks();
});

test('throws authentication error when apiKey is not specified', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { users: [] },
    more: false,
  });

  const context = createMockExecutionContext({
    instanceConfig: {},
  });
  await expect(validateInvocation(context)).rejects.toThrowError(
    authenticationFailedMessage,
  );
});

test('throws authentication error when request to api fails', async () => {
  mockedAxios.get.mockRejectedValue(new Error('Failed'));

  const context = createMockExecutionContext();
  context.instance.config = { apiKey: 'foo-api-key' };

  await expect(validateInvocation(context)).rejects.toThrowError(
    authenticationFailedMessage,
  );
});

test('returns true when the request is successful', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { users: [] },
    more: false,
  });

  const context = createMockExecutionContext();
  context.instance.config = { apiKey: 'foo-api-key' };

  await expect(validateInvocation(context)).resolves.toBe(undefined);
});
