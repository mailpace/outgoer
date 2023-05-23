/**
 * This separate test file exists because we can't find a way to mock the config
 * appropriately on a per test basis
 */

import { Job, UnrecoverableError } from 'bullmq';
import { mock } from 'jest-mock-extended';
import { EmailJobData } from '../../src/interfaces/email.js';
import * as sender from '../../src/workers/sender.js';
import { emailStates } from '../../src/interfaces/states.js';

jest.mock('../../src/lib/transports/index.js', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

// Mock the config
jest.mock('../../src/config/index.js', () => ({
  services: [],
}));

describe('processEmailJob', () => {
  let job: Job<EmailJobData, any, string>;

  beforeEach(() => {
    job = mock<Job>();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if no services were configured', async () => {
    try {
      await sender.processEmailJob(job);
      fail('Expected processEmailJob to throw UnrecoverableError');
    } catch (error) {
      expect(error).toBeInstanceOf(UnrecoverableError);
      expect(job.update).toHaveBeenCalled();
      expect(job.data.errorResponse).toContain(
        'No sending services configured.',
      );
      expect(job.data.state).toEqual(emailStates.FAILED);
    }
  });
});
