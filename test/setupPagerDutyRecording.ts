import {
  Recording,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';

export { Recording };

export function setupPagerDutyRecording(input: SetupRecordingInput): Recording {
  return setupRecording({
    ...input,
  });
}
