import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
  JobState,
} from '@jupiterone/integration-sdk';
import _ from 'lodash';

import { OnCall, Service } from '../types';
import { requestAll } from '../pager-duty';
import { reduceGroupById } from '../utils/reduceGroupById';

const step: IntegrationStep = {
  id: 'fetch-services',
  name: 'Fetch Services',
  dependsOn: ['fetch-teams', 'fetch-users'],
  types: ['pagerduty_service'],
  async executionHandler({
    logger,
    jobState,
    instance,
  }: IntegrationStepExecutionContext) {
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
        source: {
          id: service.id,
          name: service.name,
          description: service.description,
          summary: service.summary,
        },
        assign: {
          _key: `service:${service.id}`,
          _type: 'pagerduty_service',
          _class: 'Service',
          _rawData: [{ name: 'service', rawData: service }],
          category: ['software'],
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
          createIntegrationRelationship({
            _class: 'ASSIGNED',
            fromKey: `service:${service.id}`,
            fromType: `pagerduty_service`,
            toKey: teamEntity._key,
            toType: teamEntity._type,
          }),
        );
        await jobState.addRelationships(serviceRelationships);
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

  const oncallRelationships = oncalls.reduce((relationships, oncall) => {
    const escalationPolicyId = oncall.escalation_policy.id;
    const services = escalationPolicyServiceGrouping[escalationPolicyId];

    if (services) {
      relationships.push(
        ...services.map((service) =>
          createIntegrationRelationship({
            _class: 'ONCALL',
            fromKey: `user:${oncall.user.id}`,
            fromType: 'pagerduty_user',
            toKey: `service:${service.id}`,
            toType: 'pagerduty_service',
            properties: {
              escalationLevel: oncall.escalation_level,
            },
          }),
        ),
      );
    }

    return relationships;
  }, []);

  await jobState.addRelationships(oncallRelationships);
}

export default step;
