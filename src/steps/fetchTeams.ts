import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { entities } from '../constants';
import { requestAll } from '../pagerduty';
import { PagerDutyIntegrationInstanceConfig, Team } from '../types';

const step: IntegrationStep = {
  id: 'fetch-teams',
  name: 'Fetch Teams',
  entities: [entities.TEAM],
  relationships: [],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext<PagerDutyIntegrationInstanceConfig>) {
    const { apiKey } = instance.config;

    logger.info('Requesting /teams endpoint');

    const teams = await requestAll<Team>('/teams', 'teams', apiKey);
    const teamEntities = teams.map((team) =>
      createIntegrationEntity({
        entityData: {
          source: team,
          assign: {
            _key: `team:${team.id}`,
            _type: entities.TEAM._type,
            _class: entities.TEAM._class,
          },
        },
      }),
    );
    await jobState.addEntities(teamEntities);
  },
};

export default step;
