import { Queue } from 'bullmq';
import { logger } from './logger.js';
import { EmailJobData, EmailMetadata } from '../interfaces/email.js';

export const SEND_QUEUE_NAME = 'send_email_queue';

let queue: Queue<EmailJobData>;

export function initializeQueue() {
  queue = new Queue(SEND_QUEUE_NAME);
  logger.info(`${SEND_QUEUE_NAME} queue initialized`)
}

export const enqueueEmail = async (
  raw: string,
  metadata: EmailMetadata,
) => {
  const emailJobData: EmailJobData = { raw, metadata };
  await queue.add('send_email', emailJobData);
};
