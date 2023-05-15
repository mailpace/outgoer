import { Worker, Job } from 'bullmq';

import config from '../config/index.js';
import { logger } from '../lib/logger.js';
import { SEND_QUEUE_NAME } from '../lib/emailQueue.js';
import { EmailJobData } from '../interfaces/email.js';
// import { createTransport } from '../lib/transports/index.js';
import { EmailConfiguration } from '../interfaces/config.js';
import selectService from '../lib/selectPriorityService.js';

const services = config.services;

type ServiceSettings = EmailConfiguration['services'][number];

// TODO: register the worker / get it going?

const worker = new Worker<EmailJobData>(SEND_QUEUE_NAME, async (job) => {
  if (services && services.length > 0) {
    /**    
    Attempt to send, If failure to send or limit is hit, either:
    
    - retry if it’s an error we expect to solve
    - if we think the provider is broken/failing, move on by creating a new job, in a new queue called retry, with a list of excluded providers?
    - If no providers left, error
     */

    const priorityService: ServiceSettings = selectService(services, job.data.attemptedProviders); // Select the highest priority service
    if (priorityService === undefined) {
      logger.error(`Email job ${job.id} failed: All providers have been previously attempted.`)
    }
    // const transporter = createTransport(priorityService); // Build our sending service
    const transporter = {sendMail: (raw) => {console.log(raw)}}

    const { raw, metadata }: EmailJobData = job.data;
    logger.info(metadata);

    // Update the job specific data
    if (job.data.attemptedProviders) {
      job.data.attemptedProviders.push(priorityService.providerName)
    } else {
      job.data.attemptedProviders = [priorityService.providerName];
    }
    job.data.sendAttempts = job.data.sendAttempts ? job.data.sendAttempts++ : 1; // Do we need to this or will bullmq handle it?
    await job.update(job.data);

    try {
      await transporter.sendMail({raw});
      logger.info('Email sent successfully');
    } catch (error) {
      // throw new error to force requeue?
      logger.error('Failed to forward email:', error);
    }
  } else {
    // throw error to force requeue?
    logger.error(
      `Email job ${job.id} failed: No sending services configured. Please ensure there is at least one service configured.`,
    );
    }
});

worker.on('completed', (job: Job<EmailJobData>) => {
  logger.info(`Email job ${job.id} completed`);
});

worker.on('failed', (job: Job<EmailJobData>, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});
