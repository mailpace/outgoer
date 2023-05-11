import { SMTPServer } from 'smtp-server';
import { logger } from './lib/logger.js';

import config from './config/index.js';
import { initializeMetrics } from './lib/metrics.js';
import { startMetricsEndpoint } from './lib/routes.js';
import { handleError } from './hooks/onError.js';

logger.info("Launching Outgoer SMTP server and HTTP Endpoint...")

export const server = new SMTPServer(config.outgoerSmtpServer);
server.on('error', handleError);
server.listen(config.outgoerSmtpServer.port, config.outgoerSmtpServer.serverHost);

initializeMetrics();
startMetricsEndpoint();
