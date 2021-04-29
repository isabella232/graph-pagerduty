import { requestAll, request } from '../pagerduty';
import {
  setupPagerDutyRecording,
  Recording,
} from '../../test/setupPagerDutyRecording';
import { testConfig } from '../../test/config';
import { User } from '../types';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('#request', () => {
  test.only('should return limit and more properties', async () => {
    recording = setupPagerDutyRecording({
      directory: __dirname,
      name: 'request::shouldReturnLimitAndMore',
    });
    const response = await request('/users', testConfig.apiKey);
    expect(response.status).toBe(200);
    expect(response.data.limit).toBe(25);
    expect(response.data.more).toBe(false);
  });
});

describe('#requestAll', () => {
  test.only('should paginate response', async () => {
    recording = setupPagerDutyRecording({
      directory: __dirname,
      name: 'requestAll::shouldPaginateResponse',
    });

    const limitPerPage = 1;
    const response = await requestAll<User>(
      '/users',
      'users',
      testConfig.apiKey,
      limitPerPage,
    );
    expect(response.length).toBeGreaterThan(limitPerPage);
  });
});
