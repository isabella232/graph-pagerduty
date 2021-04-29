import axios, { AxiosResponse } from 'axios';

import { retry } from '@lifeomic/attempt';

import { PagerDutyQueryParams, PaginatedResponse } from './types';

export const restApi = 'https://api.pagerduty.com';

export async function request(
  endpoint: string,
  token: string,
  queryParams?: PagerDutyQueryParams,
): Promise<AxiosResponse<PaginatedResponse>> {
  return retry(
    async function () {
      return axios.get(`${restApi}${endpoint}`, {
        headers: {
          Authorization: `Token token=${token}`,
          'Content-Type': 'application/json',
        },
        params: queryParams,
      });
    },
    {
      delay: 200,
      factor: 2,
      maxAttempts: 4,
      handleError(err, context) {
        const statusCode = err?.response?.status;
        const stopRetry =
          !statusCode || (![403, 429].includes(statusCode) && statusCode < 500);

        if (stopRetry) {
          context.abort();
        }
      },
    },
  );
}
export async function requestAll<T>(
  endpoint: string,
  entity: string,
  token: string,
  limit = 100,
): Promise<T[]> {
  let cursor = 0;
  let hasMoreOnCalls: boolean;
  const requestElements: T[] = [];
  do {
    const { data } = await request(endpoint, token, {
      limit,
      offset: cursor * limit,
    });

    const resources: T[] = data[entity];
    requestElements.push(...resources);

    hasMoreOnCalls = data.more;
    cursor++;
  } while (hasMoreOnCalls);

  return requestElements;
}
