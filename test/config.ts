import * as dotenv from 'dotenv';
import * as path from 'path';

import { PagerDutyIntegrationInstanceConfig } from '../src/types';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const testConfig: PagerDutyIntegrationInstanceConfig = {
  apiKey: process.env.API_KEY || 'api-key',
};
