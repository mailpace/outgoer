import { Queue } from 'bullmq';
import { logger } from './logger.js';
import { EmailJobData, EmailMetadata } from '../interfaces/email.js';

export const SEND_QUEUE_NAME = 'send_email_queue';

/**
 * All the possible states an email can be in
 */
const EmailState = {
  QUEUED: 'queued', // has arrived and been added to email queue
  PROCESSING: 'processing', // under modification, routing, or prioritisation
  SENT: 'sent', // successfully sent to provider
  RETRYING_SAME_PROVIDER: 'retrying_same_provider', // Non-fatal provider error, retrying
  RETRYING_NEXT_PROVIDER: 'retrying_next_provider', // Fatal provider error, moving to next provider
  FAILED: 'failed', // No providers left to try, all attempts have failed
};


let queue: Queue<EmailJobData>;

export function initializeQueue(): Queue {
  queue = new Queue(SEND_QUEUE_NAME);
  logger.info(`${SEND_QUEUE_NAME} queue initialized`);
  return queue;
}

export const enqueueEmail = async (raw: string, metadata: EmailMetadata) => {
  const emailJobData: EmailJobData = { raw, metadata, state: EmailState.QUEUED };
  await queue.add("send_email", emailJobData);
};
