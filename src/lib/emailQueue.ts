import { Queue } from 'bullmq';
import { AddressObject } from 'mailparser';

interface EmailMetadata {
  to: AddressObject | AddressObject[];
  from: AddressObject;
  subject: string;
}

interface EmailJobData {
  rawEmail: string;
  metadata: EmailMetadata;
}

const SEND_QUEUE_NAME = 'send_queue';

export const enqueueEmail = async (rawEmail: string, metadata: EmailMetadata) => {
  const emailJobData: EmailJobData = { rawEmail, metadata };
  const queue = new Queue<EmailJobData>(SEND_QUEUE_NAME);
  await queue.add('send_email', emailJobData);
};
