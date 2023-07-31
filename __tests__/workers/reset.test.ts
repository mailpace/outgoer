import { Job } from 'bullmq';
import { mock } from 'jest-mock-extended';

import scheduleResetSentJobs from '../../src/workers/reset.js';
import { buildCronExpression, resetSentCount } from '../../src/workers/reset.js';
import emailConfig from '../../src/config/index.js';

describe('build cron expression', () => {
  it('should return a valid cron expression for valid input', () => {
    expect(buildCronExpression(1)).toBe('1 * * * *');
    expect(buildCronExpression(15)).toBe('15 * * * *');
    expect(buildCronExpression(30)).toBe('30 * * * *');
  });

  it('should throw an error for invalid input', () => {
    expect(() => buildCronExpression(0)).toThrow(
      'Invalid service config. limitResetDay (day of the month) must be between 1 and 30.'
    );
    expect(() => buildCronExpression(32)).toThrow(
      'Invalid service config. limitResetDay (day of the month) must be between 1 and 30.'
    );

    expect(() => buildCronExpression(-10)).toThrow(
      'Invalid service config. limitResetDay (day of the month) must be between 1 and 30.'
    );
  });

  it('should return valid cron expressions for months with 30 days', () => {
    expect(buildCronExpression(30)).toBe('30 * * * *'); // January, March, May, July, August, October, December
    expect(() => buildCronExpression(31)).toThrow(
      'Invalid service config. limitResetDay (day of the month) must be between 1 and 30.'
    ); // April, June, September, November
  });
});

const mockCleanQueue = jest.fn();
const mockAdd = jest.fn();
const mockWorkerOn = jest.fn();
const mockSetRedis = jest.fn();

jest.mock('bullmq', ()=> {
  return {
    Queue : jest.fn().mockImplementation(() => { return {
      clean: mockCleanQueue,
      add: mockAdd
    }}),
    Worker : jest.fn().mockImplementation(() => { return {
      on: mockWorkerOn,
    }}),
  }
});

jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => { 
    return { set: mockSetRedis }
  })
}));

describe('scheduleResetSentJobs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call clean queue on start', async () => {
    scheduleResetSentJobs(emailConfig);
    expect(mockCleanQueue).toHaveBeenCalledTimes(1);
  });

  it('should schedule reset jobs for services with limitResetDay set', async () => {
    emailConfig.services = [
        { name: 'service1', limitResetDay: 10, type: 'smtp', priority: 1, }
      ]

    scheduleResetSentJobs(emailConfig);

    expect(mockAdd).toHaveBeenCalledWith(
      'resetSentCount',
      { serviceName: 'service1' },
      { repeat: { pattern: "10 * * * *" } }
    );
  });
});

describe('reset sent count', () => {
  const job = mock<Job>();
  const redisOptions = {
    host: "test",
    port: 123
  };
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should find the key and set it to zero', () => {
    job.data.serviceName = "test" 
    resetSentCount(job, redisOptions)
    expect(mockSetRedis).toHaveBeenCalledTimes(1);
    expect(mockSetRedis).toHaveBeenCalledWith(`sent_emails:${job.data.serviceName}`, 0)
  });
});