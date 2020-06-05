import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';
import { requestAll } from '../pagerduty';
import { User } from '../types';
import { reduceGroupById } from '../utils';
import _ from 'lodash';
import { PagerDutyIntegrationInstanceConfig } from '../types';

const step: IntegrationStep = {
  id: 'fetch-users',
  name: 'Fetch Users',
  dependsOn: ['fetch-teams'],
  types: ['pagerduty_user', 'pagerduty_team_has_user'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext<PagerDutyIntegrationInstanceConfig>) {
    const { apiKey } = instance.config;

    logger.info('Requesting /users endpoint');
    const users = await requestAll<User>('/users', 'users', apiKey);
    const userEntities = users.map((user) =>
      createIntegrationEntity({
        entityData: {
          source: user,
          assign: {
            _key: `user:${user.id}`,
            _type: 'pagerduty_user',
            _class: 'User',
            username: user.email,
            admin: user.role === 'admin',
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
          await jobState.addRelationships(
            _.uniqBy(teamRelationships, (r) => r._key),
          );
        }
      },
    );
  },
};

export default step;
