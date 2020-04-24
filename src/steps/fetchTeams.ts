import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';
import { requestAll } from '../pager-duty';
import { Team } from '../types';
import { deleteNullProperties } from '../utils';

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
          source: deleteNullProperties(team),
          assign: {
            _key: `team:${team.id}`,
            _type: 'pagerduty_team',
            _class: 'Team',
            description: team.description,
            summary: team.summary,
          },
        },
      }),
    );
    await jobState.addEntities(teamEntities);
  },
};

export default step;
