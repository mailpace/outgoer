import { Queue } from 'bullmq';
import {
  enqueueEmail,
  initializeQueue,
  SEND_QUEUE_NAME,
} from '../../src/lib/emailQueue.js';
import { logger } from '../../src/lib/logger.js';
import { EmailMetadata } from '../../src/interfaces/email.js';

jest.mock('bullmq');
jest.mock('../../src/lib/logger.js');

describe('Email Queue', () => {
  let emailQueue: Queue;

  beforeAll(() => {
    emailQueue = initializeQueue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeQueue', () => {
    it('should have initialized the queue and logged a message', () => {
      expect(Queue).toHaveBeenCalledWith(SEND_QUEUE_NAME);
      expect(logger.info).toHaveBeenCalledWith(
        `${SEND_QUEUE_NAME} queue initialized`,
      );
    });
  });

  describe('enqueueEmail', () => {
    it('should add the email job data to the queue', async () => {
      const raw = 'email content';
      const address = {
        value: [{ address: 'to@example.com', name: 'test' }],
        html: 'test',
        text: 'test',
      }
      const metadata: EmailMetadata = {
        to: address,
        from: address,
        subject: 'Test Email',
      };

      await enqueueEmail(raw, metadata);

      expect(emailQueue.add).toHaveBeenCalledWith("send_email", {
        raw,
        metadata,
        state: "queued"
      });
    });
  });
});
