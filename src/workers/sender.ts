import { Worker, Job, UnrecoverableError, DelayedError } from 'bullmq';
import appConfig from '../config/index.js';
import { logger } from '../lib/logger.js';
import { SEND_QUEUE_NAME } from '../lib/emailQueue.js';
import { EmailJobData } from '../interfaces/email.js';
import { emailStates } from '../interfaces/states.js';
import { createTransport } from '../lib/transports/index.js';
import { EmailConfiguration } from '../interfaces/config.js';
import selectService from '../lib/selectService.js';
import convertEnvelope from '../lib/convertEnvelope.js';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

const services = appConfig.services;
type ServiceSettings = EmailConfiguration['services'][number];

// TODO: exponential back-off
const RETRY_DELAY: number = 5000;

export default function startSenderWorker() {
  const worker = new Worker<EmailJobData>(SEND_QUEUE_NAME, processEmailJob, {
    connection: appConfig.redis
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
 * TODO: update metrics
 * TODO: read the status code etc
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

  job.data.state = emailStates.PROCESSING;
  job.update(job.data);

  updateJobProviders(job, chosenService);

  const transporter = createTransport(chosenService);
  const raw: string = job.data.raw;
  const envelope = convertEnvelope(job.data.envelope);

  try {
    const response: SMTPTransport.SentMessageInfo | void = await transporter.sendMail({ raw, envelope });
    job.data.response = response;
    job.data.state = emailStates.SENT;
    await job.update(job.data);
    logger.info(`Email job ${job.id} sent successfully`);
  } catch (error: unknown) {
    console.log(error)
    handleTransporterError(job, error);
  }
}

/** Updates the job data with name of the provider about to attempt and number of attempts */
export async function updateJobProviders(job: Job<EmailJobData>, service: ServiceSettings) {
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
  job.data.errorResponse = error.message;
  job.data.state = emailStates.RETRYING;
  job.update(job.data)
  job.moveToDelayed(Date.now() + RETRY_DELAY);
  throw new DelayedError("Failed to forward email. Will attempt to resend");
}

function handleNoServicesConfigured(job: Job<EmailJobData>) {
  const errorString = "No sending services configured. Please ensure there is at least one service configured."
  logger.error(`Email job ${job.id} failed: ${errorString}`);
  job.data.errorResponse = errorString;
  job.data.state = emailStates.FAILED;
  job.update(job.data);
  throw new UnrecoverableError(`Unrecoverable: ${errorString}`);
}

function handleAllProvidersAttempted(job: Job<EmailJobData>) {
  const errorString = "All providers have been previously attempted."
  logger.error(`Email job ${job.id} failed: ${errorString}`);
  job.data.errorResponse = errorString;
  job.data.state = emailStates.FAILED;
  job.update(job.data);
  throw new UnrecoverableError(`Unrecoverable: ${errorString}`);
}

function handleJobCompleted(job: Job<EmailJobData>) {
  logger.info(`Email job ${job.id} completed`);
}

/**
 * Caught errors from the job are captured here
 * in normal use, these should not occur
 * 
 * @param job 
 * @param err 
 */
function handleJobFailed(job: Job<EmailJobData>, err: Error) {
  job.data.errorResponse = `Failed with ${err.message}`;
  job.data.state = emailStates.FAILED;
  job.update(job.data);
  logger.error(`${job.id} has failed with ${err.message}`);
  // TODO: improve this to show the full stack trace etc.
}
