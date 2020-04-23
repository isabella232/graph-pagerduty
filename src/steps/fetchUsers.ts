import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';
import { requestAll } from '../pager-duty';
import { User } from '../types';
import { reduceGroupById } from '../utils';

const step: IntegrationStep = {
  id: 'fetch-users',
  name: 'Fetch Users',
  dependsOn: ['fetch-teams'],
  types: ['pagerduty_user'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
    const { apiKey } = instance.config;

    logger.info('Requesting /users endpoint');
    const users = await requestAll<User>('/users', 'users', apiKey);
    const userEntities = users.map((user) =>
      createIntegrationEntity({
        entityData: {
          source: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
          assign: {
            _key: `user:${user.id}`,
            _type: 'pagerduty_user',
            _class: 'User',
            _rawData: [{ name: 'user', rawData: user }],
            username: user.email,
            email: user.email,
          },
        },
      }),
    );
    await jobState.addEntities(userEntities);

    const teamGrouping = reduceGroupById(users, 'teams');

    await jobState.iterateEntities(
      { _type: 'pagerduty_team' },
      async (teamEntity) => {
        const id = teamEntity._key.split(':')[1];
        if (teamGrouping[id]) {
          const teamRelationships = teamGrouping[id].map((user) =>
            createIntegrationRelationship({
              _class: 'HAS',
              fromKey: teamEntity._key,
              fromType: teamEntity._type,
              toKey: `user:${user.id}`,
              toType: `pagerduty_user`,
            }),
          );
          await jobState.addRelationships(teamRelationships);
        }
      },
    );
  },
};

export default step;
