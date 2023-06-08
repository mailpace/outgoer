import Redis from 'ioredis-mock';
import * as serviceTracker from '../../src/lib/serviceTracker.js';

// This mock does nothing for most tests as we pass in the redis client below
jest.mock('ioredis', () => ({
  Redis: jest.fn().mockReturnValue({})
}));

jest.mock('../../src/config/index.js', () => ({
  redis: {
    host: 'localhost',
    port: 6379,
  },
  services: [
    { name: 'service1' },
    { name: 'service2', limit: 5 },
    { name: 'service4', limit: 5 },
    { name: 'service space ', limit: 5 },
    { name: 'service-exists', limit: 5 },
  ],
}));

describe('incrementSenderSent', () => {
  let mockRedisClient;

  beforeEach(() => {
    mockRedisClient = new Redis.default({
      // `options.data` does not exist in `ioredis`, only `ioredis-mock`
      data: {
        'sent_emails:service4': 5,
        'sent_emails:service-exists': 1,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
    mockRedisClient.disconnect();
  });


  it('should increment count for a service without a limit', async () => {
    const serviceName = 'service1';
    await serviceTracker.incrementSenderSent(serviceName, mockRedisClient);
    expect(await mockRedisClient.get(`sent_emails:${serviceName}`)).toBe("1");
  });

  it('should increment count for a service within the limit', async () => {
    const serviceName = 'service2';
    await serviceTracker.incrementSenderSent(serviceName, mockRedisClient);
    expect(await mockRedisClient.get(`sent_emails:${serviceName}`)).toBe("1");
  });

  it('should throw an error when a service is not found', async () => {
    const serviceName = 'service3';

    await expect(
      serviceTracker.incrementSenderSent(serviceName, mockRedisClient),
    ).rejects.toThrow('Service service3 not found in the configuration.');
  });

  it('should throw an error when a service exceeds the limit', async () => {
    const serviceName = 'service4';

    await expect(
      serviceTracker.incrementSenderSent(serviceName, mockRedisClient),
    ).rejects.toThrow(
      'Service service4 has exceeded the limit of 5 emails.',
    );
  });

  it('should support services with spaces in their name', async () => {
    const serviceName = 'service space ';
    await serviceTracker.incrementSenderSent(serviceName, mockRedisClient);
    expect(await mockRedisClient.get(`sent_emails:${serviceName}`)).toBe("1");
  });

  it('should support services with an existing key in redis', async () => {
    const serviceName = 'service-exists';
    await serviceTracker.incrementSenderSent(serviceName, mockRedisClient);
    expect(await mockRedisClient.get(`sent_emails:${serviceName}`)).toBe("2");
  });

  it('should work without a redis client', async () => {
    const serviceName = 'service-exists';
    await expect(
      serviceTracker.incrementSenderSent(serviceName),
    ).rejects.toThrow(); // throws because we don't fully mock ioredis
  });
});

describe('getServices', () => {
  it('should return the services without limits', () => {
    const services = serviceTracker.getServices();

    expect(services).toEqual([
      { name: 'service1', limit: undefined },
      { name: 'service2', limit: 5 },
      { name: 'service4', limit: 5 },
      { name: 'service space ', limit: 5 },
      { name: 'service-exists', limit: 5 },
    ]);
  });
});
