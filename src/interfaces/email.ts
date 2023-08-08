import { SMTPServerEnvelope } from 'smtp-server';
import { SentMessage } from './transports.js';

export interface EmailJobData {
  raw: string;
  envelope: SMTPServerEnvelope;
  state: string;
  attemptedProviders?: { [key: string]: AttemptedProvider };
  response?: SentMessage | void;
  errorResponse?: string;
}

export interface AttemptedProvider {
  attempts: number;
}
