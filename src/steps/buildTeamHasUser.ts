import _ from 'lodash';

import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { entities, relationships } from '../constants';
import { PagerDutyIntegrationInstanceConfig, User } from '../types';

const step: IntegrationStep<PagerDutyIntegrationInstanceConfig> = {
  id: 'build-team-has-user',
  name: 'Build Team Has User',
  dependsOn: ['fetch-teams', 'fetch-users'],
  entities: [],
  relationships: [relationships.TEAM_HAS_USER],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext<PagerDutyIntegrationInstanceConfig>) {
    await jobState.iterateEntities(
      { _type: entities.USER._type },
      async (userEntity) => {
        const userData = getRawData<User>(userEntity);
        if (userData.teams) {
          const teamRelationships = userData.teams.map((team) =>
            createDirectRelationship({
              _class: relationships.TEAM_HAS_USER._class,
              fromKey: `team:${team.id}`,
              fromType: entities.TEAM._type,
              toKey: userEntity._key,
              toType: entities.USER._type,
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
