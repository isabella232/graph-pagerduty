import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchServices from './steps/fetchServices';
import fetchTeams from './steps/fetchTeams';
import fetchUsers from './steps/fetchUsers';
import fetchOncalls from './steps/fetchOncalls';
import buildServiceAssignedTeam from './steps/buildServiceAssignedTeam';
import buildTeamHasUser from './steps/buildTeamHasUser';
import { PagerDutyIntegrationInstanceConfig } from './types';

import { getStepStartStates } from './utils';

export const invocationConfig: IntegrationInvocationConfig<PagerDutyIntegrationInstanceConfig> = {
  instanceConfigFields,
  validateInvocation,
  getStepStartStates,
  integrationSteps: [
    fetchServices,
    fetchTeams,
    fetchUsers,
    fetchOncalls,
    buildServiceAssignedTeam,
    buildTeamHasUser,
  ],
};
