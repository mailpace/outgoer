/**
 * This separate test file exists because we can't find a way to mock the config
 * or createTransport appropriately on a per test basis
 */

import { DelayedError, Job, UnrecoverableError } from 'bullmq';
import { mock } from 'jest-mock-extended';
import { EmailJobData } from '../../src/interfaces/email.js';
import * as sender from '../../src/workers/sender.js';
import { emailStates } from '../../src/interfaces/states.js';
import { initializeMetrics } from '../../src/lib/metrics.js';

jest.mock('../../src/lib/transports/index.js', () => ({
  createTransport: jest.fn(() => ({
    sendMail: () => {
      throw new Error('');
    },
  })),
}));

jest.mock('../../src/lib/serviceTracker.js', () => ({
  incrementSenderSent: jest.fn((name) => ({
    name
  })),
}));


jest.mock('bullmq');

describe('Worker events', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    initializeMetrics();
  });

  test("should handle 'failed' event correctly", () => {
    const job = mock<Job>();
    job.data = {
      state: 'queued',
      raw: 'email raw data',
      envelope: {
        mailFrom: {
          address: 'test@example.com',
          args: {},
        },
        rcptTo: [
          {
            address: 'recipient1@example.com',
            args: {},
          },
        ],
      },
      attemptedProviders: {},
    };
    let error: Error;
    try {
      sender.handleJobFailed(job, new Error('Test error'));
      throw('Expected handleJobFailed to throw unrecoverable error');
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(UnrecoverableError);
    expect(job.data.state).toEqual(emailStates.FAILED);
    expect(job.data.errorResponse).toEqual('Failed with Test error');
  });
});

describe('processEmailJob', () => {
  let job: Job<EmailJobData, any, string>;

  beforeEach(() => {
    job = mock<Job>();
    job.data = {
      state: 'queued',
      raw: 'email raw data',
      envelope: {
        mailFrom: {
          address: 'test@example.com',
          args: {},
        },
        rcptTo: [
          {
            address: 'recipient1@example.com',
            args: {},
          },
        ],
      },
      attemptedProviders: {},
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should throw a delayed error if an error is thrown by the transport', async () => {
    let error: Error;
    try {
      await sender.processEmailJob(job);
      throw('Expected processEmailJob to throw DelayedError');
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(DelayedError);
    expect(job.data.state).toEqual(emailStates.RETRYING);
  });
});
