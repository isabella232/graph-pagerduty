import {
  IntegrationExecutionContext,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';
import { PagerDutyIntegrationInstanceConfig } from '../types';
import { requestAll } from '../pagerduty';
import fetchServices from '../steps/fetchServices';
import fetchTeams from '../steps/fetchTeams';
import fetchUsers from '../steps/fetchUsers';

export async function getStepStartStates(
  executionContext: IntegrationExecutionContext<
    PagerDutyIntegrationInstanceConfig
  >,
): Promise<StepStartStates> {
  let disableTeamsStep = false;
  const abilityList: string[] = await requestAll(
    '/abilities',
    'abilities',
    executionContext.instance.config.apiKey,
    1,
  );

  // Currently, we're only able to disable the Teams step
  // based on unlocked abilities.  If this changes in the
  // future, we can add the ability to disable further.
  if (!abilityList.includes('teams')) {
    disableTeamsStep = true;
  }

  return {
    [fetchServices.id]: { disabled: false },
    [fetchTeams.id]: { disabled: disableTeamsStep },
    [fetchUsers.id]: { disabled: false },
  };
}
