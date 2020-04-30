import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';
import { requestAll } from '../pagerduty';
import { Team } from '../types';

const step: IntegrationStep = {
  id: 'fetch-teams',
  name: 'Fetch Teams',
  types: ['pagerduty_team'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { apiKey } = instance.config;

    logger.info('Requesting /teams endpoint');

    const teams = await requestAll<Team>('/teams', 'teams', apiKey);
    const teamEntities = teams.map((team) =>
      createIntegrationEntity({
        entityData: {
          source: team,
          assign: {
            _key: `team:${team.id}`,
            _type: 'pagerduty_team',
            _class: 'Team',
          },
        },
      }),
    );
    await jobState.addEntities(teamEntities);
  },
};

export default step;
