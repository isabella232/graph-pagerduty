import _ from 'lodash';

import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { entities, relationships } from '../constants';
import { requestAll } from '../pagerduty';
import {
  PagerDutyIntegrationInstanceConfig,
  User,
  OnCall,
  Service,
} from '../types';

const step: IntegrationStep<PagerDutyIntegrationInstanceConfig> = {
  id: 'build-user-monitors-service',
  name: 'Build User Monitors Service',
  dependsOn: ['fetch-users', 'fetch-services'],
  entities: [],
  relationships: [relationships.USER_MONITORS_SERVICE],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext<PagerDutyIntegrationInstanceConfig>) {
    const { apiKey } = instance.config;

    logger.info('Requesting /oncalls endpoint');
    const oncalls = await requestAll<OnCall>('/oncalls', 'oncalls', apiKey);
    const oncallLookup = Object.assign(
      {},
      ...oncalls.map((x) => ({ [x.escalation_policy.id]: x })),
    );

    await jobState.iterateEntities(
      { _type: entities.SERVICE._type },
      async (serviceEntity) => {
        const serviceData = getRawData<Service>(serviceEntity);
        if (
          serviceData.escalation_policy &&
          oncallLookup[serviceData.escalation_policy.id].user?.id
        ) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: relationships.USER_MONITORS_SERVICE._class,
              fromKey: `user:${
                oncallLookup[serviceData.escalation_policy.id].user.id
              }`,
              fromType: entities.USER._type,
              toKey: serviceEntity._key,
              toType: entities.SERVICE._type,
              properties: {
                escalationLevel:
                  oncallLookup[serviceData.escalation_policy.id]
                    .escalation_level,
              },
            }),
          );
        }
      },
    );
  },
};

export default step;
