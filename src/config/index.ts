import config from 'config';

import { handleStream } from '../hooks/onData.js';
import { logger } from '../lib/logger.js';
import { EmailConfiguration } from '../interfaces/config.js';
import onAuth from '../hooks/onAuth.js';

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
  onAuth,
};

// Dynamically import onAuth function from a file path
if (emailConfig.customAuthPath) {
  import(emailConfig.customAuthPath)
    .then((customOnAuth) => {
      if (typeof customOnAuth.default === 'function') {
        defaultOutgoerSmtpSettings.onAuth = customOnAuth.default;
      } else {
        throw new Error(
          "Provided onAuth is not a function, ensure that your onAuth function is defined as the default export"
        );
      }
    })
    .catch((error) => {
      logger.error('Failed to import custom onAuth function ', error);
    });
}

// Combine the supplied configured settings with the default ones
const combinedOptions = {
  ...defaultOutgoerSmtpSettings,
  ...emailConfig.outgoerSmtpServer,
};

// override the settings on the config options
emailConfig.outgoerSmtpServer = combinedOptions;

export default emailConfig;
