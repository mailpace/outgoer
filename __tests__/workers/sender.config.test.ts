/**
 * This separate test file exists because we can't find a way to mock the config
 * or createTransport appropriately on a per test basis
 */

import { Job, UnrecoverableError } from 'bullmq';
import { mock } from 'jest-mock-extended';
import { EmailJobData } from '../../src/interfaces/email.js';
import * as sender from '../../src/workers/sender.js';
import { emailStates } from '../../src/interfaces/states.js';
import { initializeMetrics } from '../../src/lib/metrics.js';

jest.mock('../../src/lib/transports/index.js', () => ({
  createTransport: jest.fn(),
}));

// Mock the config
jest.mock('../../src/config/index.js', () => ({
  services: [],
}));

jest.mock('../../src/lib/serviceTracker.js', () => ({
  incrementSenderSent: jest.fn((name) => ({
    name
  })),
}));


describe('processEmailJob', () => {
  let job: Job<EmailJobData, string, string>;

  beforeAll(() => {
    initializeMetrics();
  });

  beforeEach(() => {
    job = mock<Job>();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if no services were configured', async () => {
    let error: Error;
    try {
      await sender.processEmailJob(job);
      throw new Error("Expected processEmailJob to throw UnrecoverableError");
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(UnrecoverableError);
    expect(job.update).toHaveBeenCalled();
    expect(job.data.errorResponse).toContain(
      'No sending services configured.',
    );
    expect(job.data.state).toEqual(emailStates.FAILED);
  });
});
