import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchServices from './steps/fetchServices';
import fetchTeams from './steps/fetchTeams';
import fetchUsers from './steps/fetchUsers';

export const invocationConfig: IntegrationInvocationConfig = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [fetchServices, fetchTeams, fetchUsers],
};
