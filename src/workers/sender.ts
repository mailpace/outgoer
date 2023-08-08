import { Worker, Job, UnrecoverableError, DelayedError } from 'bullmq';
import appConfig from '../config/index.js';
import { logger } from '../lib/logger.js';
import { SEND_QUEUE_NAME } from '../lib/emailQueue.js';
import { EmailJobData } from '../interfaces/email.js';
import { emailStates } from '../interfaces/states.js';
import { createTransport } from '../lib/transports/index.js';
import { EmailConfiguration } from '../interfaces/config.js';
import { incrementEmailsSent } from '../lib/metrics.js';
import selectService from '../lib/selectService.js';
import convertEnvelope from '../lib/convertEnvelope.js';
import { ServiceNotFound, incrementSenderSent } from '../lib/serviceTracker.js';
import { SentMessage, Transport } from '../interfaces/transports.js';

const services = appConfig.services;
type ServiceSettings = EmailConfiguration['services'][number];

const RETRY_DELAY = 5000;

export default function startSenderWorker(): Worker<EmailJobData, any, string> {
  const worker = new Worker<EmailJobData>(SEND_QUEUE_NAME, processEmailJob, {
    connection: appConfig.redis
  });

  worker.on('failed', handleJobFailed);
  worker.on('completed', () => { incrementEmailsSent('success') });
  // TODO: update metrics with gauge for active emails
  
  return worker;
}

/**
 * Processes emails by selecting a service based on the priority index, and ignoring services which have already exceeded 5 attempts

 * TODO: exponential / fibonacci / user provided back off
 * TODO: update metrics
 */
export async function processEmailJob(job: Job<EmailJobData>) {
  if (!services || services.length === 0) {
    handleNoServicesConfigured(job);
  }

  let chosenService: ServiceSettings = selectService(services, job.data.attemptedProviders || {});

  if (!chosenService) {
    handleAllProvidersAttempted(job);
  }

  job.data.state = emailStates.PROCESSING;
  job.update(job.data);

  updateJobProviders(job, chosenService);

  try {
    await incrementSenderSent(chosenService.name);
  } catch (error) {
    if (error instanceof ServiceNotFound) {
      handleJobFailed(job, error);
    } else {
      // ServiceLimitExceeded, or other error, move on to the next service
      const filteredServices = services.filter(service => service.name !== chosenService.name); // remove the chosenService
      chosenService = selectService(filteredServices, job.data.attemptedProviders || {}); // update the chosen service
      if (!chosenService) {
        handleAllProvidersAttempted(job);
      }
    }
  }

  const transporter: Transport = createTransport(chosenService);
  const raw: string = job.data.raw;
  const envelope = convertEnvelope(job.data.envelope); // TODO: FIX BCC ETC HERE / downstream?

  try {
    const response: SentMessage = await transporter.sendMail({ raw, envelope });
    job.data.response = response;
    job.data.state = emailStates.SENT;
    await job.update(job.data);
    logger.info(`Email job ${job.id} sent successfully`);
  } catch (error: unknown) {
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
  const errorString = "Failed to forward email. Will attempt to resend."
  logger.error(`Email job ${job.id} transporter error: ${errorString}`, error);
  job.data.errorResponse = error.message;
  job.data.state = emailStates.RETRYING;
  job.update(job.data)
  job.moveToDelayed(Date.now() + RETRY_DELAY);
  throw new DelayedError(`${errorString}`);
}

function handleNoServicesConfigured(job: Job<EmailJobData>) {
  const errorString = "No sending services configured. Please ensure there is at least one service configured."
  logger.error(`Email job ${job.id} failed: ${errorString}`);
  job.data.errorResponse = errorString;
  job.data.state = emailStates.FAILED;
  job.update(job.data);
  incrementEmailsSent('failed');
  throw new UnrecoverableError(`Unrecoverable: ${errorString}`);
}

function handleAllProvidersAttempted(job: Job<EmailJobData>) {
  const errorString = "All providers have been previously attempted."
  logger.error(`Email job ${job.id} failed: ${errorString}`);
  job.data.errorResponse = errorString;
  job.data.state = emailStates.FAILED;
  job.update(job.data);
  incrementEmailsSent('failed');
  throw new UnrecoverableError(`Unrecoverable: ${errorString}`);
}

/**
 * Caught errors from the job are captured here
 * in normal use, these should not occur
 * 
 * @param job 
 * @param err 
 */
export function handleJobFailed(job: Job<EmailJobData>, err: Error) {
  const errorString = `${job.id} has failed with ${err.message} ${err.name} ${err.cause} ${err.stack}`
  job.data.errorResponse = `Failed with ${err.message}`;
  job.data.state = emailStates.FAILED;
  job.update(job.data);
  logger.error(`Unexpected sender job error. ${errorString}`);
  incrementEmailsSent('failed');
  throw new UnrecoverableError(`Unrecoverable: ${errorString}`);
}
