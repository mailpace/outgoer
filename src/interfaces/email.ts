import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { SMTPServerEnvelope } from 'smtp-server';

export interface EmailJobData {
  raw: string;
  envelope: SMTPServerEnvelope;
  state: string;
  attemptedProviders?: { [key: string]: AttemptedProvider };
  response?: SMTPTransport.SentMessageInfo | void;
}

export interface AttemptedProvider {
  attempts: number;
}
