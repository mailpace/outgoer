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

jest.mock('../../src/lib/serviceTracker.js', () => ({
  incrementSenderSent: jest.fn((name) => ({
    name
  })),
}));

jest.mock('bullmq');

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

  afterAll(async () => {
    jest.clearAllMocks();
  });


  it('should send email successfully', async () => {
    const processEmailJobSpy = jest.spyOn(sender, 'processEmailJob');

    await sender.processEmailJob(job);
    expect(processEmailJobSpy).toHaveBeenCalledWith(job);

    expect(job.update).toHaveBeenCalledWith(job.data);
    expect(job.data.state).toBe(emailStates.SENT)
    // TODO: improve assertions
  });

  it('should handle undefined attempted providers', async () => {
    const processEmailJobSpy = jest.spyOn(sender, 'processEmailJob');
    job.data = {
      ...job.data,
      attemptedProviders: undefined,
    };
    await sender.processEmailJob(job)
    expect(processEmailJobSpy).toHaveBeenCalledWith(job);
    expect(job.update).toHaveBeenCalledWith(job.data);
    expect(job.data.state).toBe(emailStates.SENT)
  });
  
  it('should handle no chosen service left', async () => {
    job.data = {
      ...job.data,
      attemptedProviders: {
        "smtp test 2": { // from the default.json config. TODO: mock config
          attempts: 10,
        }
      }
    };

    try {
      await sender.processEmailJob(job);
      fail('Expected processEmailJob to throw UnrecoverableError');
    } catch (error) {
      expect(error).toBeInstanceOf(UnrecoverableError);
      expect(job.update).toHaveBeenCalled();
      expect(job.data.errorResponse).toContain(
        'All providers have been previously attempted.',
      );
      expect(job.data.state).toEqual(emailStates.FAILED);
    }
  });

  it('should increment attempts', async () => {
    job.data = {
      ...job.data,
      attemptedProviders: {
        "smtp test 2": { // from the default.json config. TODO: mock config
          attempts: 1,
        }
      }
    };
    await sender.processEmailJob(job);
    expect(job.data.attemptedProviders["smtp test 2"].attempts).toBe(2);
  });

  it('should start sender worker', () => {
    const startSenderWorkerSpy = jest.spyOn(sender, 'default');
    sender.default();
    expect(startSenderWorkerSpy).toHaveBeenCalled();
    // TODO: better assertion that the worker is added to the queue
  });

  it('should increment the sent counter per provider', () => {
    // TODO
  });
});
