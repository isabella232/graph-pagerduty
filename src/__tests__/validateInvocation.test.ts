import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import validateInvocation from '../validateInvocation';

import {
  setupPagerDutyRecording,
  Recording,
} from '../../test/setupPagerDutyRecording';
import { testConfig } from '../../test/config';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('validateInvocation', () => {
  test('should throw if no apiKey provided', async () => {
    const context = createMockExecutionContext({
      instanceConfig: { apiKey: (undefined as unknown) as string },
    });

    await expect(validateInvocation(context)).rejects.toThrow(
      'ERROR: Context is missing apiKey configuration variable',
    );
  });

  test('should return undefined for valid configuration', async () => {
    recording = setupPagerDutyRecording({
      directory: __dirname,
      name: 'validateInvocation::shouldReturnUndefinedForValidConfiguration',
    });

    const context = createMockExecutionContext({
      instanceConfig: testConfig,
    });

    await expect(validateInvocation(context)).resolves.toBeUndefined();
  });

  test('should throw if apiKey is invalid', async () => {
    recording = setupPagerDutyRecording({
      directory: __dirname,
      name: 'validateInvocation::shouldThrowIfApiKeyIsInvalid',
      options: { recordFailedRequests: true },
    });

    const context = createMockExecutionContext({
      instanceConfig: { apiKey: 'invalid-api-key' },
    });

    await expect(validateInvocation(context)).rejects.toThrow(
      'Provider authentication failed at https://api.pagerduty.com/users: undefined Request failed with status code 404. Please ensure you have configured a valid PagerDuty General Access REST API Key.',
    );
  });
});
