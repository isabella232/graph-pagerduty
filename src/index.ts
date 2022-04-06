import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchServices from './steps/fetchServices';
import fetchTeams from './steps/fetchTeams';
import fetchUsers from './steps/fetchUsers';
import { PagerDutyIntegrationInstanceConfig } from './types';

import { getStepStartStates } from './utils';

export const invocationConfig: IntegrationInvocationConfig<PagerDutyIntegrationInstanceConfig> = {
  instanceConfigFields,
  validateInvocation,
  getStepStartStates,
  integrationSteps: [fetchServices, fetchTeams, fetchUsers],
};
