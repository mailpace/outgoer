import { SMTPServer } from 'smtp-server';
import { logger } from './lib/logger.js';

import appConfig from './config/index.js';
import { initializeMetrics } from './lib/metrics.js';
import { startMetricsEndpoint } from './lib/routes.js';
import { handleError } from './hooks/onError.js';
import { initializeQueue } from './lib/emailQueue.js';
import startSenderWorker from './workers/sender.js';

logger.info(`Launching ${appConfig.outgoerSmtpServer.name} SMTP server and Dashboard...`)

initializeQueue();
initializeMetrics();
startMetricsEndpoint();
startSenderWorker();

export const server = new SMTPServer(appConfig.outgoerSmtpServer);
server.on('error', handleError);
server.listen(appConfig.outgoerSmtpServer.port, appConfig.outgoerSmtpServer.serverHost);
