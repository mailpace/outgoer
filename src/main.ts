import { SMTPServer } from 'smtp-server';

import config from './config/index.js';
import { handleError } from './lib/onError.js';

const env = process.env.NODE_ENV || 'development';

const options = {
  ...config.base.default,
  ...config[env].default(),
};

export const server = new SMTPServer(options);
server.on('error', handleError);
server.listen('2525', options.serverHost);
