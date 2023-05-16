import { Queue } from 'bullmq';
import {
  enqueueEmail,
  initializeQueue,
  SEND_QUEUE_NAME,
} from '../../src/lib/emailQueue.js';
import { logger } from '../../src/lib/logger.js';
import { SMTPServerEnvelope } from 'smtp-server';

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
      expect(Queue).toHaveBeenCalledWith(SEND_QUEUE_NAME, {"connection": {"host": "localhost", "port": 6379}});
      expect(logger.info).toHaveBeenCalledWith(
        `${SEND_QUEUE_NAME} queue initialized`,
      );
    });
  });

  describe('enqueueEmail', () => {
    it('should add the email job data to the queue', async () => {
      const raw = 'email content';
      const envelope: SMTPServerEnvelope = {
        mailFrom: {
          address: 'sender@example.com',
          args: {}
        },
        rcptTo: [
          {
            address: 'recipient1@example.com',
            args: {}
          }
        ]
      };
      await enqueueEmail(raw, envelope);

      expect(emailQueue.add).toHaveBeenCalledWith("send_email", {
        raw,
        envelope,
        state: "queued"
      });
    });
  });
});
