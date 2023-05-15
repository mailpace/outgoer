import nodemailer from 'nodemailer';
import { EmailConfiguration } from '../../interfaces/config.js';

type ServiceSettings = EmailConfiguration['services'][number];

// Each transporter must expose at sendEmail function



export function createTransport(service: ServiceSettings) {
  if (service.type === 'smtp') {
    
    return nodemailer.createTransport(service.smtpSettings);
  } else {
    // TODO
    return nodemailer.createTransport();
  }
}
