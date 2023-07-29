import { Queue } from 'bullmq';
import { SMTPServerEnvelope } from 'smtp-server';
import { logger } from './logger.js';
import { EmailJobData } from '../interfaces/email.js';
import { emailStates } from '../interfaces/states.js';
import { EmailConfiguration } from '../interfaces/config.js';

export const SEND_QUEUE_NAME = 'send_email_queue';

let queue: Queue<EmailJobData>;

export function initializeQueue(appConfig: EmailConfiguration): Queue {
  queue = new Queue(SEND_QUEUE_NAME, { connection: appConfig.redis });
  logger.info(`${SEND_QUEUE_NAME} queue initialized`);
  return queue;
}

export const enqueueEmail = async (raw: string, envelope: SMTPServerEnvelope) => {
  const emailJobData: EmailJobData = { raw, envelope, state: emailStates.QUEUED };
  await queue.add("send_email", emailJobData);
};
