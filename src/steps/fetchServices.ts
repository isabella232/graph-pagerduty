import _ from 'lodash';

import {
  createDirectRelationship,
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  JobState,
} from '@jupiterone/integration-sdk-core';

import { entities, relationships } from '../constants';
import { requestAll } from '../pagerduty';
import { OnCall, PagerDutyIntegrationInstanceConfig, Service } from '../types';
import { reduceGroupById } from '../utils';

const step: IntegrationStep = {
  id: 'fetch-services',
  name: 'Fetch Services',
  dependsOn: ['fetch-teams', 'fetch-users'],
  entities: [entities.SERVICE],
  relationships: [
    relationships.SERVICE_ASSIGNED_TEAM,
    relationships.USER_MONITORS_SERVICE,
  ],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext<PagerDutyIntegrationInstanceConfig>) {
    logger.info('Requesting /services endpoint');
    const { apiKey } = instance.config;
    const services = await requestAll<Service>('/services', 'services', apiKey);

    await buildServiceEntities(jobState, services);

    await buildTeamRelations(jobState, services);

    logger.info('Requesting /oncalls endpoint');
    const oncalls = await requestAll<OnCall>('/oncalls', 'oncalls', apiKey);

    await buildOnCallRelations(jobState, oncalls, services);
  },
};

async function buildServiceEntities(
  jobState: JobState,
  services: Service[],
): Promise<void> {
  const serviceEntities = services.map((service) =>
    createIntegrationEntity({
      entityData: {
        source: service,
        assign: {
          _key: `service:${service.id}`,
          _type: 'pagerduty_service',
          _class: 'Service',
          category: ['software'],
          active: service.status === 'active',
          endpoints: [service.html_url],
        },
      },
    }),
  );

  await jobState.addEntities(serviceEntities);
}

async function buildTeamRelations(
  jobState: JobState,
  services: Service[],
): Promise<void> {
  const teamServiceGrouping = reduceGroupById(services, 'teams');

  await jobState.iterateEntities(
    { _type: 'pagerduty_team' },
    async (teamEntity) => {
      const id = teamEntity._key.split(':')[1];
      if (teamServiceGrouping[id]) {
        const serviceRelationships = teamServiceGrouping[id].map((service) =>
          createDirectRelationship({
            _class: relationships.SERVICE_ASSIGNED_TEAM._class,
            fromKey: `service:${service.id}`,
            fromType: entities.SERVICE._type,
            toKey: teamEntity._key,
            toType: teamEntity._type,
          }),
        );
        await jobState.addRelationships(
          _.uniqBy(serviceRelationships, (r) => r._key),
        );
      }
    },
  );
}

async function buildOnCallRelations(
  jobState: JobState,
  oncalls: OnCall[],
  services: Service[],
): Promise<void> {
  const escalationPolicyServiceGrouping = _.chain(services)
    .groupBy((service) => service.escalation_policy.id)
    .value();

  const oncallRelationships = oncalls.reduce((acc, oncall) => {
    const escalationPolicyId = oncall.escalation_policy.id;
    const services = escalationPolicyServiceGrouping[escalationPolicyId];

    if (services) {
      acc.push(
        ...services.map((service) =>
          createDirectRelationship({
            _class: relationships.USER_MONITORS_SERVICE._class,
            fromKey: `user:${oncall.user.id}`,
            fromType: entities.USER._type,
            toKey: `service:${service.id}`,
            toType: entities.SERVICE._type,
            properties: {
              escalationLevel: oncall.escalation_level,
            },
          }),
        ),
      );
    }

    return acc;
  }, []);

  await jobState.addRelationships(_.uniqBy(oncallRelationships, (r) => r._key));
}

export default step;
