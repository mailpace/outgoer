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


  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeQueue', () => {
    it('should initialize the queue and log a message', () => {
      initializeQueue();
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

      // TODO assert
      /** 
      expect(queueAddMock).toHaveBeenCalledWith('send_email', {
        raw,
        metadata,
      });
       */
    });
  });
});
