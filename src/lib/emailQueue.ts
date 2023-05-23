import { Queue } from 'bullmq';
import { SMTPServerEnvelope } from 'smtp-server';
import appConfig from '../config/index.js';
import { logger } from './logger.js';
import { EmailJobData } from '../interfaces/email.js';
import { emailStates } from '../interfaces/states.js';

export const SEND_QUEUE_NAME = 'send_email_queue';

let queue: Queue<EmailJobData>;

export function initializeQueue(): Queue {
  queue = new Queue(SEND_QUEUE_NAME, { connection: appConfig.redis });
  logger.info(`${SEND_QUEUE_NAME} queue initialized`);
  return queue;
}

export const enqueueEmail = async (raw: string, envelope: SMTPServerEnvelope) => {
  const emailJobData: EmailJobData = { raw, envelope, state: emailStates.QUEUED };
  await queue.add("send_email", emailJobData);
};
