import { Worker, Job, UnrecoverableError, DelayedError } from 'bullmq';
import config from '../config/index.js';
import { logger } from '../lib/logger.js';
import { SEND_QUEUE_NAME } from '../lib/emailQueue.js';
import { EmailJobData } from '../interfaces/email.js';
import { createTransport } from '../lib/transports/index.js';
import { EmailConfiguration } from '../interfaces/config.js';
import selectService from '../lib/selectService.js';
import convertEnvelope from '../lib/convertEnvelope.js';

const services = config.services;
type ServiceSettings = EmailConfiguration['services'][number];

// TODO: exponential back-off
const RETRY_DELAY: number = 5000;

export default function startSenderWorker() {
  const worker = new Worker<EmailJobData>(SEND_QUEUE_NAME, processEmailJob, {
    connection: config.redis
  });

  worker.on('completed', handleJobCompleted);
  worker.on('failed', handleJobFailed);
}

/**
 * Processes emails by selecting a service based on the priority index, and ignoring services which have already exceeded 5 attempts
 * It tracks the state by updating the job data
 * If all providers have exceeded 5 attempts the job fails
 * 
 * TODO: handle complete provider outages, before attempting 5 attempts (if possible?)
 * TODO: configurable per provider max attempts
 * TODO: sending limits per provider (remove the service if limits exceeded)
 * TODO: update states
 * TODO: update metrics
 * TODO: store the SMTP response in the Job
 * TODO: pass errors back from transport into job
 */
export async function processEmailJob(job: Job<EmailJobData>) {
  if (!services || services.length === 0) {
    handleNoServicesConfigured(job);
    return;
  }

  const chosenService: ServiceSettings = selectService(services, job.data.attemptedProviders || {});

  if (!chosenService) {
    handleAllProvidersAttempted(job);
    return;
  }

  updateJobData(job, chosenService);

  const transporter = createTransport(chosenService);
  const raw: string = job.data.raw;

  const envelope = convertEnvelope(job.data.envelope);

  try {
    transporter.sendMail({ raw, envelope });
    logger.info(`Email job ${job.id} sent successfully`);
  } catch (error) {
    handleTransporterError(job, error);
  }
}

/** Updates the job data with name of the provider about to attempt and number of attempts */
export async function updateJobData(job: Job<EmailJobData>, service: ServiceSettings) {
  const name = service.name;

  if (!job.data.attemptedProviders) {
    job.data.attemptedProviders = {};
  }

  if (!job.data.attemptedProviders[name]) { // new provider
    job.data.attemptedProviders[name] = { attempts: 1 };
  } else { // we've attempted this one already
    job.data.attemptedProviders[name].attempts++;
  }

  await job.update(job.data);
}
  
/**
 * Error handling
 */

function handleTransporterError(job: Job<EmailJobData>, error: any) {
  logger.error(`Email job ${job.id} transporter error: Failed to forward email. Will attempt to resend`, error);
  job.moveToDelayed(RETRY_DELAY);
  throw new DelayedError();
}

function handleNoServicesConfigured(job: Job<EmailJobData>) {
  logger.error(`Email job ${job.id} failed: No sending services configured. Please ensure there is at least one service configured.`);
  throw new UnrecoverableError('Unrecoverable:  No sending services configured');
}

function handleAllProvidersAttempted(job: Job<EmailJobData>) {
  logger.error(`Email job ${job.id} failed: All providers have been previously attempted.`);
  throw new UnrecoverableError('Unrecoverable: All providers have been previously attempted.');
}

function handleJobCompleted(job: Job<EmailJobData>) {
  logger.info(`Email job ${job.id} completed`);
}

function handleJobFailed(job: Job<EmailJobData>, err: Error) {
  logger.error(`${job.id} has failed with ${err.message}`);
  // TODO: improve this to show the full stack trace etc.
}
