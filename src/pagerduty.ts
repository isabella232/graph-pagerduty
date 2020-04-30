import axios from 'axios';
import { retry } from '@lifeomic/attempt';
import { PagerDutyResponse, PagerDutyQueryParams } from './types';

export const restApi = 'https://api.pagerduty.com';

export async function request<T>(
  endpoint: string,
  token: string,
  queryParams?: PagerDutyQueryParams,
): Promise<PagerDutyResponse<T>> {
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
  let hasMoreOnCalls;
  const requestElements = [];
  do {
    const { data, more } = await request<T[]>(endpoint, token, {
      limit,
      offset: cursor * limit,
    });

    requestElements.push(...data[entity]);

    hasMoreOnCalls = more;
    cursor++;
  } while (hasMoreOnCalls);

  return requestElements;
}
