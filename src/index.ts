import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchServices from './steps/fetchServices';
import fetchTeams from './steps/fetchTeams';
import fetchUsers from './steps/fetchUsers';
import { PagerDutyIntegrationInstanceConfig } from './types';

export const invocationConfig: IntegrationInvocationConfig<PagerDutyIntegrationInstanceConfig> = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [fetchServices, fetchTeams, fetchUsers],
};
