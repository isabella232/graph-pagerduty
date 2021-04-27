import {
  IntegrationExecutionContext,
  IntegrationProviderAPIError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { requestAll } from './pagerduty';
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
    throw new IntegrationProviderAPIError({
      cause: e,
      endpoint: '/users',
      status: e.status || e.code,
      statusText: e.statusText || e.message,
    });
  }
}
