import {
  IntegrationExecutionContext,
  IntegrationProviderAuthenticationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { requestAll, restApi } from './pagerduty';
import { PagerDutyIntegrationInstanceConfig } from './types';

export default async function validateInvocation(
  context: IntegrationExecutionContext<PagerDutyIntegrationInstanceConfig>,
): Promise<void> {
  context.logger.info(
    {
      instance: context.instance,
    },
    'Validating integration config...',
  );

  if (!context.instance.config.apiKey) {
    throw new IntegrationValidationError(
      'ERROR: Context is missing apiKey configuration variable',
    );
  }

  try {
    await requestAll('/users', 'users', context.instance.config.apiKey, 1);
  } catch (e) {
    const pdApiKeyError = new IntegrationProviderAuthenticationError({
      cause: e,
      endpoint: restApi + '/users',
      status: e.status || e.code,
      statusText: e.statusText || e.message,
    });

    // PagerDuty allows users to configure either general access REST api keys OR event API keys. Clarify for customers which they should be using.
    pdApiKeyError.message +=
      '. Please ensure you have configured a valid PagerDuty General Access REST API Key.';
    throw pdApiKeyError;
  }
}
