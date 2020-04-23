import { IntegrationExecutionContext } from '@jupiterone/integration-sdk';
import { requestAll } from './pager-duty';

export const authenticationFailedMessage = 'Config requires apiKey to be set';

export default async function validateInvocation(
  context: IntegrationExecutionContext,
): Promise<void> {
  context.logger.info(
    {
      instance: context.instance,
    },
    'Validating integration config...',
  );

  if (await isConfigurationValid(context.instance.config)) {
    context.logger.info('PagerDuty Integration is valid!');
  } else {
    throw new Error(authenticationFailedMessage);
  }
}

async function isConfigurationValid(config: {
  apiKey: string;
}): Promise<boolean> {
  if (!config.apiKey) return false;

  try {
    await requestAll('/users', 'users', config.apiKey, 1);
    return true;
  } catch (e) {
    return false;
  }
}
