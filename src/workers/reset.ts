import { Job, Queue, Worker } from 'bullmq';
import { EmailConfiguration } from '../interfaces/config.js';
import { logger } from '../lib/logger.js';
import { Redis, RedisOptions } from 'ioredis';

const RESET_QUEUE_NAME = "reset_monthly_sent_queue";

export default function scheduleResetSentJobs(appConfig: EmailConfiguration) {
  const queue = new Queue(RESET_QUEUE_NAME, { connection: appConfig.redis });

  // Remove any existing jobs from the queue, from previous starts
  queue.clean(0, 0, "delayed");
  
  // Add a reset job for every service to the queue
  appConfig.services.forEach(async (service) => {
    if(service.limitResetDay) {
      const pattern = buildCronExpression(service.limitResetDay);
      const serviceName = service.name;

      await queue.add(
        'resetSentCount',
        { serviceName },
        { repeat: { pattern } },
      );
    }
  });

  startResetWorker(appConfig); // Start the worker to process the resets
};

export function startResetWorker(appConfig: EmailConfiguration): Worker {
  const worker = new Worker(
    RESET_QUEUE_NAME,
    async (job) => {
      try {
        await resetSentCount(job, appConfig.redis);
      } catch (error) {
        console.error('Error processing job:', error);
      }
    },
    { connection: appConfig.redis }
  );
  
  worker.on('completed', (job) => {
    logger.info(`Reset sent count for service, with Job ${job.id} completed.`);
  });
  
  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error: ${err.message}`)
  });

  return worker;
}

export function buildCronExpression(dayOfMonth: number): string {
  if (dayOfMonth < 1 || dayOfMonth > 30) {
    throw new Error('Invalid service config. limitResetDay (day of the month) must be between 1 and 30.');
  }

  return `${dayOfMonth} * * * *`;
}

export async function resetSentCount(job: Job<any, any, string>, redisConnectionDetails: RedisOptions) {
  const redisClient = new Redis(
    redisConnectionDetails
  );
  const key = `sent_emails:${job.data.serviceName}`;
  try {
    await redisClient.set(key, 0);
  } catch (error) {
    logger.error(`Error resetting sent count for ${job.data.serviceName}`);
  }
}