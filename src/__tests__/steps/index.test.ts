import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk/testing';

import fetchTeamsStep from '../../steps/fetchTeams';
import fetchUsersStep from '../../steps/fetchUsers';
import fetchServicesStep from '../../steps/fetchServices';

let recording: Recording;
let context;
beforeAll(async () => {
  recording = setupRecording({
    name: 'pagerduty-recording',
    directory: __dirname,
    redactedRequestHeaders: ['Authorization'],
    options: {},
  });

  context = createMockStepExecutionContext();
  await fetchTeamsStep.executionHandler(context);
  await fetchUsersStep.executionHandler(context);
  await fetchServicesStep.executionHandler(context);
});

afterAll(async () => {
  await recording.stop();
});

describe('team entities', () => {
  test('generate correct entities', () => {
    const teamEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === 'pagerduty_team',
    );

    expect(teamEntities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          summary: expect.any(String),
          _key: expect.stringMatching(/team:PT.*/g),
          _type: 'pagerduty_team',
          _class: ['Team'],
          _rawData: expect.any(Array),
          displayName: expect.any(String),
        }),
      ]),
    );
    expect(teamEntities).toHaveLength(17);
  });
});

describe('users entities/relationships', () => {
  test('generates user entities', () => {
    const userEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === 'pagerduty_user',
    );

    expect(userEntities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          _key: expect.stringMatching(/user:PU.*/g),
          _type: 'pagerduty_user',
          _class: ['User'],
          _rawData: expect.any(Array),
          displayName: expect.any(String),
        }),
      ]),
    );
    expect(userEntities).toHaveLength(50);
  });

  test('generate user/team relationships', () => {
    const userTeamRelationships = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'pagerduty_team_has_user',
    );

    expect(userTeamRelationships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _key: expect.stringMatching(/team:PT.*\|has\|user:PU.*/g),
          _type: 'pagerduty_team_has_user',
          _class: 'HAS',
          _fromEntityKey: expect.stringMatching(/team:.*/g),
          _toEntityKey: expect.stringMatching(/user:.*/g),
          displayName: 'HAS',
        }),
      ]),
    );
    expect(userTeamRelationships).toHaveLength(74);
  });
});

describe('service entities/relationships', () => {
  test('generate service entities', () => {
    const serviceEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === 'pagerduty_service',
    );

    expect(serviceEntities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          summary: expect.any(String),
          _key: expect.stringMatching(/service:PS.*/g),
          _type: 'pagerduty_service',
          _class: ['Service'],
          _rawData: expect.any(Array),
          category: ['software'],
          status: expect.any(String),
          active: expect.any(Boolean),
          displayName: expect.any(String),
        }),
      ]),
    );
    expect(serviceEntities).toHaveLength(45);
  });

  test('generates service/team relationsips', () => {
    const serviceTeamRelationships = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'pagerduty_service_assigned_team',
    );

    expect(serviceTeamRelationships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _key: expect.stringMatching(/service:PS.*\|assigned\|team:PT.*/g),
          _type: 'pagerduty_service_assigned_team',
          _class: 'ASSIGNED',
          _fromEntityKey: expect.stringMatching(/service:.*/g),
          _toEntityKey: expect.stringMatching(/team:.*/g),
          displayName: 'ASSIGNED',
        }),
      ]),
    );
    expect(serviceTeamRelationships).toHaveLength(45);
  });

  test('generates service/user relationships', () => {
    const serviceUserRelationships = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'pagerduty_user_oncall_service',
    );

    expect(serviceUserRelationships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _key: expect.stringMatching(/user:PU.*\|oncall\|service:PS.*/g),
          _type: 'pagerduty_user_oncall_service',
          _class: 'ONCALL',
          _fromEntityKey: expect.stringMatching(/user:PU.*/g),
          _toEntityKey: expect.stringMatching(/service:PS.*/g),
          displayName: 'ONCALL',
          escalationLevel: expect.any(Number),
        }),
      ]),
    );
    expect(serviceUserRelationships).toHaveLength(150);
  });
});
