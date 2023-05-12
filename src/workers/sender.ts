import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';

import { logger } from '../lib/logger.js';
import { SEND_QUEUE_NAME } from '../lib/emailQueue.js';
import { EmailJobData } from '../interfaces/email.js';

const smtpServers = [
  // TODO: from config
  // Add more SMTP servers as needed
];

// TODO: Select the SMTP transport
const transporter = nodemailer.createTransport(smtpServers[0]);

const worker = new Worker(SEND_QUEUE_NAME, async (job) => {
  const { raw, metadata }: EmailJobData = job.data;

  logger.info(metadata)

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
});

worker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});
