import { EmailConfiguration } from '../../interfaces/config.js';
import { Transport, SentMessage, RawEmail } from '../../interfaces/transports.js';

import { Transporter, createTransport } from 'nodemailer';

type ServiceSettings = EmailConfiguration['services'][number]['smtpSettings'];

class SMTPTransport implements Transport {
  private client: Transporter;

  constructor(settings: ServiceSettings) {
    this.client = createTransport(settings);
  }

  sendMail: (email: RawEmail) => Promise<SentMessage> = async (email: RawEmail) => {
    try {
      const info = await this.client.sendMail(email);
      return {
        messageId: info.messageId,
        response: info.response,
        responseCode: 200,
      };
    } catch (error) {
      return {
        messageId: '',
        response: 'Error sending email',
        responseCode: 500,
        error: error as Error,
      };
    }
  };
}

export default SMTPTransport;
