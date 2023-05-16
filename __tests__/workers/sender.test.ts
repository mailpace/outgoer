import { Job } from 'bullmq';
import { mock } from 'jest-mock-extended';
import { processEmailJob } from '../../src/workers/sender.js';

jest.mock('../../src/lib/transports/index.js', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

jest.mock('bullmq');

describe('processEmailJob', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should send email successfully', async () => {
    const job = mock<Job>();
    job.data = {
      state: 'queued',
      raw: 'email raw data',
      envelope: {
        mailFrom: {
          address: 'test@example.com',
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

    processEmailJob(job)

    expect(job.update).toHaveBeenCalledWith(job.data);
    // expect(createTransportMock).toHaveBeenCalledWith(expect.anything());
    // expect(createTransportMock().sendMail).toHaveBeenCalledWith({
    //  raw: job.data.raw,
    //  envelope: job.data.envelope,
    //});
  });
});
