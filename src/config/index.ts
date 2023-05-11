import config from 'config';

import { handleStream } from '../hooks/onData.js';
import { logger } from '../lib/logger.js';
import { EmailConfiguration } from '../interfaces/config.js';

// Load config from ENV Vars, Config file or CLI Options
export const emailConfig: EmailConfiguration = config.util.toObject();

const defaultOutgoerSmtpSettings = {
  name: 'smtp.outgoer',
  secure: false,
  serverHost: '127.0.0.1',
  authMethods: ['PLAIN', 'LOGIN'],
  authOptional: true,
  onData: handleStream,
  size: 30 * 1024 * 1024, // 30 MB default limit,
  logger,
};

// Combine the supplied configured settings with the default ones
const combinedOptions = {
  ...emailConfig.outgoerSmtpServer,
  ...defaultOutgoerSmtpSettings,
};

// override the settings on the config options
emailConfig.outgoerSmtpServer = combinedOptions;

export default emailConfig;
