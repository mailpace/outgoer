import { SMTPServerEnvelope } from 'smtp-server';

export interface EmailJobData {
  raw: string;
  envelope: SMTPServerEnvelope;
  state: string;
  attemptedProviders?: { [key: string]: AttemptedProvider };
}

export interface AttemptedProvider {
  attempts: number;
}
