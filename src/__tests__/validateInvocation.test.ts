import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { mocked } from 'ts-jest/utils';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = mocked(axios, true);

import validateInvocation from '../validateInvocation';
import { PagerDutyIntegrationInstanceConfig } from '../types';

beforeEach(() => {
  jest.resetAllMocks();
});

test('throws authentication error when apiKey is not specified', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { users: [] },
    more: false,
  });

  const context = createMockExecutionContext<
    PagerDutyIntegrationInstanceConfig
  >({
    instanceConfig: {
      apiKey: undefined as any,
    },
  });
  await expect(validateInvocation(context)).rejects.toThrowError(
    'ERROR: Context is missing apiKey configuration variable',
  );
});

test('throws authentication error when request to api fails', async () => {
  mockedAxios.get.mockRejectedValue(new Error('Failed'));

  const context = createMockExecutionContext<
    PagerDutyIntegrationInstanceConfig
  >();
  context.instance.config = { apiKey: 'foo-api-key' };

  await expect(validateInvocation(context)).rejects.toThrowError(
    'Provider API failed at /users: undefined Failed',
  );
});

test('does not throw when the request is successful', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { users: [] },
    more: false,
  });

  const context = createMockExecutionContext<
    PagerDutyIntegrationInstanceConfig
  >();
  context.instance.config = { apiKey: 'foo-api-key' };
  context.logger.info = jest.fn();

  await expect(validateInvocation(context)).resolves.toBeUndefined();
});
