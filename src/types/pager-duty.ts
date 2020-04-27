import { AxiosResponse } from 'axios';

export interface PagerDutyResponse<T> extends AxiosResponse<T> {
  more: boolean;
}

export interface PagerDutyQueryParams {
  offset?: number;
  limit?: number;
}

/**
 * Types generated with: https://app.quicktype.io/?l=ts
 */
export interface User {
  name: string;
  email: string;
  time_zone: string;
  color: string;
  avatar_url: string;
  billed: boolean;
  role: string;
  description?: string;
  invitation_sent: boolean;
  job_title?: string;
  teams: Relation[];
  contact_methods: Relation[];
  notification_rules: NotificationRule[];
  coordinated_incidents: Relation[];
  id: string;
  type: string;
  summary: string;
  self: string;
  html_url: string;
}

export interface Relation {
  id: string;
  type: string;
  summary: string;
  self: string;
  html_url: string;
}

export interface NotificationRule {
  id: string;
  type: string;
  summary: string;
  self: string;
  html_url?: string;
  start_delay_in_minutes: number;
  contact_method: NotificationRuleContactMethod;
  urgency: string;
}

export interface NotificationRuleContactMethod {
  id: string;
  type: string;
  summary: string;
  self: string;
  html_url?: string;
  label: string;
  address: string;
  send_short_email?: boolean;
  send_html_email?: boolean;
  device_type?: string;
  sounds?: Sound[];
  blacklisted?: boolean;
  created_at?: Date;
  country_code?: number;
  enabled?: boolean;
}

export interface Sound {
  type: string;
  file: string;
}

export interface OnCall {
  escalation_policy: Relation;
  escalation_level: number;
  schedule: Relation;
  user?: Relation;
  start: Date;
  end: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  type: string;
  summary?: string;
  self: string;
  html_url: string;
  default_role: string;
  parent?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  status: string;
  teams: Relation[];
  alert_creation: string;
  addons: Relation[];
  scheduled_actions: ScheduledAction[];
  support_hours?: SupportHoursClass;
  last_incident_timestamp?: Date;
  escalation_policy: EscalationPolicy;
  incident_urgency_rule: IncidentUrgencyRule;
  acknowledgement_timeout: number;
  auto_resolve_timeout?: string;
  integrations: Relation[];
  type: string;
  summary: string;
  self: string;
  html_url: string;
}

export interface EscalationPolicy {
  id: string;
  type: string;
  summary: string;
  self: string;
  html_url: string;
  name: string;
  escalation_rules: EscalationRule[];
  services: Relation[];
  num_loops: number;
  teams: Relation[];
  description: string;
  on_call_handoff_notifications: string;
  privilege?: string;
}

export interface EscalationRule {
  id: string;
  escalation_delay_in_minutes: number;
  targets: Relation[];
}

export interface IncidentUrgencyRule {
  type: string;
  urgency?: string;
  during_support_hours?: SupportHours;
  outside_support_hours?: SupportHours;
}

export interface SupportHours {
  type: string;
  urgency: string;
}

export interface ScheduledAction {
  type: string;
  at: At;
  to_urgency: string;
}

export interface At {
  type: string;
  name: string;
}

export interface SupportHoursClass {
  type: string;
  time_zone: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
}
