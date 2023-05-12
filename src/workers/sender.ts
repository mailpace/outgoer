import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { EmailConfiguration } from '../interfaces/config.js';

import config from '../config/index.js';
import { logger } from '../lib/logger.js';
import { SEND_QUEUE_NAME } from '../lib/emailQueue.js';
import { EmailJobData } from '../interfaces/email.js';

const services = config.services;

// TODO: if the request fails, is too slow, or the limit is hit, how do we select the next priority provider?
// We need to store that we attempted delivery for this service/email


const worker = new Worker(SEND_QUEUE_NAME, async (job) => {
  if (services) {
    const sortedServices = services.sort((a, b) => a.priority - b.priority);
    const priority = sortedServices[0]

    const transporter = createTransport(priority);

    const { raw, metadata }: EmailJobData = job.data;

    logger.info(metadata);

    try {
      await transporter.sendMail({
        raw,
        envelope: {
          // TODO, do we need this?
        },
      });

      logger.info('Email forwarded successfully');
    } catch (error) {
      logger.error('Failed to forward email:', error);
    }
  }

  logger.error(
    `Email job ${job.id} failed: No sending services configured. Please ensure there is at least one service configured.`,
  );
});

worker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});

type ServiceSettings = EmailConfiguration['services'][number];

function createTransport(service: ServiceSettings) {
    if (service.type === "smtp") {
        return nodemailer.createTransport(service.smtpSettings);
    }
    else {
        // TODO
        return nodemailer.createTransport()
    }
}