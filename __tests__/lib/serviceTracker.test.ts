import Redis from 'redis';
import * as serviceTracker from '../../src/lib/serviceTracker.js';

jest.mock('redis', () => {
  let count = 0;
  const mockIncr = jest.fn(() => {
    count++;
    return count;
  });

  return {
    createClient: jest.fn(() => ({
      incr: mockIncr,
    })),
  };
});

jest.mock('../../src/config/index.js', () => ({
  redis: {
    host: 'localhost',
    port: 6379,
  },
  services: [
    { name: 'service1' },
    { name: 'service2', limit: 5 },
    { name: 'service4', limit: 1 },
    { name: 'service space ', limit: 5 },
  ],
}));

describe('incrementSenderSent', () => {
  let mockRedisClient;

  beforeEach(() => {
    mockRedisClient = Redis.createClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should increment count for a service without a limit', () => {
    const serviceName = 'service1';
    serviceTracker.incrementSenderSent(serviceName, mockRedisClient);
    expect(mockRedisClient.incr).toHaveBeenCalledWith('sent_emails:service1');
  });

  it('should increment count for a service within the limit', () => {
    const serviceName = 'service2';
    serviceTracker.incrementSenderSent(serviceName, mockRedisClient);
    expect(mockRedisClient.incr).toHaveBeenCalledWith('sent_emails:service2');
  });

  it('should throw an error when a service is not found', async () => {
    const serviceName = 'service3';

    await expect(
      serviceTracker.incrementSenderSent(serviceName, mockRedisClient),
    ).rejects.toThrowError('Service service3 not found in the configuration.');
  });

  it('should throw an error when a service exceeds the limit', async () => {
    const serviceName = 'service4';

    await expect(
      serviceTracker.incrementSenderSent(serviceName, mockRedisClient),
    ).rejects.toThrowError(
      'Service service4 has exceeded the limit of 1 emails.',
    );
  });

  it('should support services with spaces in their name', () => {
    const serviceName = 'service space ';

    serviceTracker.incrementSenderSent(serviceName, mockRedisClient);

    expect(mockRedisClient.incr).toHaveBeenCalledWith(
      'sent_emails:service space ',
    );
  });
});

describe('getServices', () => {
  it('should return the services without limits', () => {
    const services = serviceTracker.getServices();

    expect(services).toEqual([
      { name: 'service1', limit: undefined },
      { name: 'service2', limit: 5 },
      { name: 'service4', limit: 1 },
      { name: 'service space ', limit: 5 },
    ]);
  });
});
