export * from './pagerduty';

/**
 * Properties provided by the `IntegrationInstance.config`. The value supplied is
 * the readonly apiKey supplied as an environment variable.
 */
export interface PagerDutyIntegrationInstanceConfig {
  apiKey: string;
}
