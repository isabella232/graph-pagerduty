import {
  IntegrationExecutionContext,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';
import { requestAll } from './pagerduty';
import { PagerDutyIntegrationInstanceConfig } from './types';

export const authenticationFailedMessage =
  'Failed to authenticate with given apiKey';
export const authenticationSucceededMessage = 'PagerDuty Integration is valid!';

export default async function validateInvocation(
  context: IntegrationExecutionContext<PagerDutyIntegrationInstanceConfig>,
): Promise<void> {
  context.logger.info(
    {
      instance: context.instance,
    },
    'Validating integration config...',
  );

  if (await isConfigurationValid(context.instance.config, context.logger)) {
    context.logger.info(authenticationSucceededMessage);
  } else {
    throw new Error(authenticationFailedMessage);
  }
}

async function isConfigurationValid(
  config: {
    apiKey: string;
  },
  logger: IntegrationLogger,
): Promise<boolean> {
  if (!config.apiKey) return false;

  try {
    await requestAll('/users', 'users', config.apiKey, 1);
    return true;
  } catch (err) {
    logger.warn(err, 'Failed to authenticate isConfigurationValid');
    return false;
  }
}
