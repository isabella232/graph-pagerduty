import axios, { AxiosPromise } from 'axios';
import { getStepStartStates } from '../getStepStartStates';

const mockResp: AxiosPromise = Promise.resolve({
  data: {
    abilities: [
      'teams',
      'read_only_users',
      'service_support_hours',
      'urgencies',
    ],
  },
  status: 200,
  statusText: '',
  headers: {},
  config: {},
});

const mockNoTeamResp: AxiosPromise = Promise.resolve({
  data: {
    abilities: ['read_only_users', 'service_support_hours', 'urgencies'],
  },
  status: 200,
  statusText: '',
  headers: {},
  config: {},
});

describe('getStepStartStates', () => {
  const executionContext = {
    instance: {
      config: {},
    },
  };
  test('it returns correct all-enabled values', async () => {
    const spy = jest.spyOn(axios, 'get').mockReturnValue(mockResp);
    const abilityWithTeamsSteps = await getStepStartStates(
      executionContext as any,
    );

    expect(spy).toHaveBeenCalled();
    expect(abilityWithTeamsSteps).toEqual({
      'build-service-assigned-team': { disabled: false },
      'build-team-has-user': { disabled: false },
      'build-user-monitors-service': { disabled: false },
      'fetch-services': { disabled: false },
      'fetch-teams': { disabled: false },
      'fetch-users': { disabled: false },
    });
  });

  test('it returns correct teams disabled values', async () => {
    const spy = jest.spyOn(axios, 'get').mockReturnValue(mockNoTeamResp);
    const abilityWithNoTeamsSteps = await getStepStartStates(
      executionContext as any,
    );

    expect(spy).toHaveBeenCalled();
    expect(abilityWithNoTeamsSteps).toEqual({
      'build-service-assigned-team': { disabled: true },
      'build-team-has-user': { disabled: true },
      'build-user-monitors-service': { disabled: false },
      'fetch-services': { disabled: false },
      'fetch-teams': { disabled: true },
      'fetch-users': { disabled: false },
    });
  });
});
