import _ from 'lodash';

import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  JobState,
} from '@jupiterone/integration-sdk-core';

import { entities, relationships } from '../constants';
import { requestAll } from '../pagerduty';
import { PagerDutyIntegrationInstanceConfig, Service } from '../types';

export async function fetchServices({
  logger,
  jobState,
  instance,
}: IntegrationStepExecutionContext<PagerDutyIntegrationInstanceConfig>) {
  logger.info('Requesting /services endpoint');
  const { apiKey } = instance.config;
  const services = await requestAll<Service>('/services', 'services', apiKey);

  await buildServiceEntities(jobState, services);
}

const step: IntegrationStep<PagerDutyIntegrationInstanceConfig> = {
  id: 'fetch-services',
  name: 'Fetch Services',
  dependsOn: [],
  entities: [entities.SERVICE],
  relationships: [
    relationships.SERVICE_ASSIGNED_TEAM,
    relationships.USER_MONITORS_SERVICE,
  ],
  executionHandler: fetchServices,
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

export default step;
