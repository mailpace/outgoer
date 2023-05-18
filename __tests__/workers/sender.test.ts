import { Job } from 'bullmq';
import { mock } from 'jest-mock-extended';
import { processEmailJob } from '../../src/workers/sender.js';
import { EmailJobData } from '../../src/interfaces/email.js';

jest.mock('../../src/lib/transports/index.js', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
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

  afterAll(() => {
    jest.clearAllMocks();
  });


  it('should send email successfully', () => {
    processEmailJob(job)

    expect(job.update).toHaveBeenCalledWith(job.data);
    // expect(createTransportMock).toHaveBeenCalledWith(expect.anything());
    // expect(createTransportMock().sendMail).toHaveBeenCalledWith({
    //  raw: job.data.raw,
    //  envelope: job.data.envelope,
    //});
  });

  it('should throw an error if no services were configured', () => {
    
  })
});
