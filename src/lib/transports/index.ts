import { EmailConfiguration } from '../../interfaces/config.js';
import { Transport } from '../../interfaces/transports.js';

import MailPaceTransport from './mailpace.js';
import SMTPTransport from './smtp.js';

type ServiceSettings = EmailConfiguration['services'][number];

export function createTransport(service: ServiceSettings): Transport {
    switch (service.provider) {
      case "smtp":
        return new SMTPTransport(service.smtpSettings);
      case "mailpace":
        return new MailPaceTransport(service.api_key);    
      // case "postmark":
      //  break;
      //case "ses":
      //  break;
      // More todo
      default:
        throw new Error(`Service ${service.name} is not supported by Outgoer.`)
  }
}
