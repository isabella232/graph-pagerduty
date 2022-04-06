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
  id: 'build-service-assigned-team',
  name: 'Build Service Assigned Team',
  dependsOn: ['fetch-teams', 'fetch-services'],
  entities: [],
  relationships: [relationships.SERVICE_ASSIGNED_TEAM],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext<PagerDutyIntegrationInstanceConfig>) {
    await jobState.iterateEntities(
      { _type: entities.SERVICE._type },
      async (serviceEntity) => {
        const serviceData = getRawData<User>(serviceEntity);
        if (serviceData.teams) {
          const serviceRelationships = serviceData.teams.map((team) =>
            createDirectRelationship({
              _class: relationships.SERVICE_ASSIGNED_TEAM._class,
              fromKey: serviceEntity._key,
              fromType: entities.SERVICE._type,
              toKey: `team:${team.id}`,
              toType: entities.TEAM._type,
            }),
          );
          await jobState.addRelationships(
            _.uniqBy(serviceRelationships, (r) => r._key),
          );
        }
      },
    );
  },
};

export default step;
