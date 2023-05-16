import { Worker, Job, UnrecoverableError, DelayedError } from 'bullmq';

import config from '../config/index.js';
import { logger } from '../lib/logger.js';
import { SEND_QUEUE_NAME } from '../lib/emailQueue.js';
import { EmailJobData } from '../interfaces/email.js';
import { createTransport } from '../lib/transports/index.js';
import { EmailConfiguration } from '../interfaces/config.js';
import selectService from '../lib/selectPriorityService.js';

const services = config.services;

type ServiceSettings = EmailConfiguration['services'][number];

const MAX_SEND_ATTEMPTS: number = 10;
// const MAX_SEND_ATTEMPTS_PER_PROVIDER: number = 5; // do we need this?
const RETRY_DELAY: number = 5000;

export default function startSenderWorker() {
  const worker = new Worker<EmailJobData>(SEND_QUEUE_NAME, async (job, token: string) => {
    if (services && services.length > 0) {
      const priorityService: ServiceSettings = selectService(services, job.data.attemptedProviders); // Select the highest priority service
      if (priorityService === undefined) {
        logger.error(`Email job ${job.id} failed: All providers have been previously attempted.`)
        throw new UnrecoverableError('Unrecoverable'); // This will move the job to failure, regardless of attempts remaining
      }
      const transporter = createTransport(priorityService);

      const { raw, metadata }: EmailJobData = job.data;
      logger.info(metadata);

      // Update the job specific data
      if (job.data.attemptedProviders) {
        job.data.attemptedProviders.push(priorityService.providerName)
      } else {
        job.data.attemptedProviders = [priorityService.providerName];
      }
      job.data.sendAttempts = job.data.sendAttempts ? job.data.sendAttempts++ : 1;
      await job.update(job.data);

      try {
        await transporter.sendMail({raw});
        logger.info(`Email job ${job.id} sent successfully`);
      } catch (error) {
        logger.error(`Email job ${job.id} transporter error: Failed to forward email. Will attempt to resend`, error);
        if (job.data.sendAttempts < MAX_SEND_ATTEMPTS) {
          // job.moveToDelayed(RETRY_DELAY, token);
          // throw new DelayedError();
          logger.info(job.data.sendAttempts, token, RETRY_DELAY, DelayedError)
        }
      }
    } else {
      logger.error(`Email job ${job.id} failed: No sending services configured. Please ensure there is at least one service configured.`);
      throw new UnrecoverableError('Unrecoverable'); 
    }
  }, {
    connection: config.redis
  });

  worker.on('completed', (job: Job<EmailJobData>) => {
    logger.info(`Email job ${job.id} completed`);
  });

  worker.on('failed', (job: Job<EmailJobData>, err) => {
    logger.error(`${job.id} has failed with ${err.message}`);
  });
}