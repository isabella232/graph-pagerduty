import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { entities, relationships } from '../constants';
import { requestAll } from '../pagerduty';
import { PagerDutyIntegrationInstanceConfig, User } from '../types';

const step: IntegrationStep<PagerDutyIntegrationInstanceConfig> = {
  id: 'fetch-users',
  name: 'Fetch Users',
  dependsOn: [],
  entities: [entities.USER],
  relationships: [relationships.TEAM_HAS_USER],
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
            _type: entities.USER._type,
            _class: entities.USER._class,
            id: user.id,
            type: user.type,
            username: user.email,
            email: user.email,
            role: user.role,
            admin: user.role === 'admin',
            jobTitle: user.job_title,
            timeZone: user.time_zone,
            billed: user.billed,
            description: user.description,
            invitationSent: user.invitation_sent,
            webLink: user.html_url,
          },
        },
      }),
    );
    await jobState.addEntities(userEntities);
  },
};

export default step;
