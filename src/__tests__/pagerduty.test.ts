import { mocked } from 'ts-jest/utils';
import axios from 'axios';
import range from 'lodash/range';

import { requestAll, request, restApi } from '../pagerduty';

jest.mock('axios');
const mockedAxios = mocked(axios, true);

const token = 'api-token';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('request', () => {
  const successfulResponse = { data: { users: [] }, more: false };

  test('returns response when request is successful', async () => {
    const queryParams = { limit: 100 };
    mockedAxios.get.mockResolvedValueOnce(successfulResponse);

    await expect(request('/users', token, queryParams)).resolves.toEqual(
      successfulResponse,
    );
    expect(mockedAxios.get).toBeCalledWith(`${restApi}/users`, {
      headers: {
        Authorization: `Token token=${token}`,
        'Content-Type': 'application/json',
      },
      params: queryParams,
    });
  });

  test.each([403, 429, 500])(
    'retries the request when the request returns retryable status code: %d',
    async (status) => {
      const mockResponse = { data: { users: [] }, more: false };

      mockedAxios.get
        .mockRejectedValueOnce({ response: { status } })
        .mockResolvedValueOnce(mockResponse);

      await expect(request('/users', 'users')).resolves.toEqual(mockResponse);
      expect(mockedAxios.get).toBeCalledTimes(2);
    },
  );

  test.each([400, 401])(
    'does not retry when the request returns non-retryable status code: %d',
    async (status) => {
      const mockResponse = { response: { status } };
      mockedAxios.get.mockRejectedValueOnce(mockResponse);

      await expect(request('/users', 'users')).rejects.toEqual(mockResponse);
      expect(mockedAxios.get).toBeCalledTimes(1);
    },
  );

  test('does not retry when the request returns an error without a status code', async () => {
    const mockResponse = { response: { message: 'Network Error' } };
    mockedAxios.get.mockRejectedValueOnce(mockResponse);

    await expect(request('/users', 'users')).rejects.toEqual(mockResponse);
    expect(mockedAxios.get).toBeCalledTimes(1);
  });
});

describe('requestAll', () => {
  test('returns paginate results within a single array', async () => {
    const users = range(0, 10).map((id) => ({
      id,
    }));

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { users: users.slice(0, 5) },
        more: true,
      })
      .mockResolvedValueOnce({
        data: { users: users.slice(5) },
        more: false,
      });

    await expect(requestAll('/users', 'users', token, 5)).resolves.toEqual(
      users,
    );
    await expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
