import { SMTPServer } from 'smtp-server';

import config from './config/index.js';
import { initializeMetrics } from './lib/metrics.js';
import { startMetricsEndpoint } from './lib/routes.js';
import { handleError } from './hooks/onError.js';

const env = process.env.NODE_ENV || 'development';

const options = {
  ...config.base.default,
  ...config[env].default(),
};

export const server = new SMTPServer(options);
server.on('error', handleError);
server.listen('2525', options.serverHost);

initializeMetrics();
startMetricsEndpoint();
