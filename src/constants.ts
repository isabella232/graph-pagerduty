import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export const entities = {
  TEAM: {
    _type: 'pagerduty_team',
    _class: ['Team'],
    resourceName: 'Team',
  },
  USER: {
    _type: 'pagerduty_user',
    _class: ['User'],
    resourceName: 'User',
  },
  SERVICE: {
    _type: 'pagerduty_service',
    _class: ['Service'],
    resourceName: 'Service',
  },
};

export const relationships = {
  TEAM_HAS_USER: {
    _type: 'pagerduty_team_has_user',
    sourceType: entities.TEAM._type,
    _class: RelationshipClass.HAS,
    targetType: entities.USER._type,
  },
  SERVICE_ASSIGNED_TEAM: {
    _type: 'pagerduty_service_assigned_team',
    sourceType: entities.SERVICE._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: entities.TEAM._type,
  },
  USER_MONITORS_SERVICE: {
    _type: 'pagerduty_user_monitors_service',
    sourceType: entities.USER._type,
    _class: RelationshipClass.MONITORS,
    targetType: entities.SERVICE._type,
  },
};
