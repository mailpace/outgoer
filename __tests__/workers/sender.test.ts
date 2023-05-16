import { Job } from 'bullmq';
import { mock } from 'jest-mock-extended';
import { processEmailJob } from '../../src/workers/sender.js';

// jest.mock('bullmq');

describe('processEmailJob', () => {
  it('should send email successfully', async () => {
    const job = mock<Job>();
    job.data = {
        state: "queued",
        raw: 'email raw data',
        envelope: {
            mailFrom: false,
            rcptTo: [
              {
                address: 'recipient1@example.com',
                args: {}
              }
            ]
          },
        attemptedProviders: {} // Add any additional required properties
      };

    // Mock the createTransport function
    const createTransportMock = jest.fn(() => ({
      sendMail: jest.fn()
    }));
    jest.mock('../../src/lib/transports/index.js', () => ({
      createTransport: createTransportMock
    }));

    // Call the function
    await processEmailJob(job);

    // Check that the job was updated and sendMail was called
    expect(job.update).toHaveBeenCalledWith(job.data);
    expect(createTransportMock).toHaveBeenCalledWith(expect.anything());
    expect(createTransportMock().sendMail).toHaveBeenCalledWith({
      raw: job.data.raw,
      envelope: job.data.envelope
    });
  });
});
