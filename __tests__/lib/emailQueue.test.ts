import { enqueueEmail } from '../../src/lib/emailQueue.js';
import { Queue } from 'bullmq';

jest.mock('bullmq');

describe('enqueueEmail', () => {
  const addMock = jest.fn();

  beforeEach(() => {
    (Queue as unknown as jest.Mock).mockImplementation(() => ({
      add: addMock,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a queue and add a job to it with the correct data', async () => {
    const rawEmail = 'Hello World!';
    const metadata = {
      to: { value: [{address: 'example@gmail.com', name: 'example' }], html: "test", text: "test"},
      from:  { value: [{address: 'example@gmail.com', name: 'example' }], html: "test", text: "test"},
      subject: 'Test Email',
    };

    await enqueueEmail(rawEmail, metadata);

    expect(Queue).toHaveBeenCalledWith('send_queue');
    expect(addMock).toHaveBeenCalledWith('send_email', { rawEmail, metadata });
  });
});
