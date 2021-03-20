import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';

export * from './pagerduty';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface PagerDutyIntegrationInstanceConfig
  extends IntegrationInstanceConfig {
  apiKey: string;
}
