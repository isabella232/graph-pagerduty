import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { mocked } from 'ts-jest/utils';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = mocked(axios, true);

import validateInvocation, {
  authenticationFailedMessage,
  authenticationSucceededMessage,
} from '../validateInvocation';
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
      apiKey: undefined,
    },
  });
  await expect(validateInvocation(context)).rejects.toThrowError(
    authenticationFailedMessage,
  );
});

test('throws authentication error when request to api fails', async () => {
  mockedAxios.get.mockRejectedValue(new Error('Failed'));

  const context = createMockExecutionContext<
    PagerDutyIntegrationInstanceConfig
  >();
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

  const context = createMockExecutionContext<
    PagerDutyIntegrationInstanceConfig
  >();
  context.instance.config = { apiKey: 'foo-api-key' };
  context.logger.info = jest.fn();

  await validateInvocation(context);

  expect(context.logger.info).toHaveBeenCalledWith(
    authenticationSucceededMessage,
  );
});
