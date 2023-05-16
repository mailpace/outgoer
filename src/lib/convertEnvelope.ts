import { SMTPServerEnvelope, SMTPServerAddress } from 'smtp-server';
import { Envelope } from 'nodemailer/lib/mailer/index.js';

/**
 * 
 * @param smtpEnvelope The SMTP envelope (with RCPT TO Mail From fields)
 * @returns an envelope object with from and to as a comma separate string
 * 
 * Note that we don't fill out cc or bcc here, as the Raw email contains the mime envelope definition that end users see
 * 
 * TODO: support SMTP envelope args see https://nodemailer.com/extras/smtp-server/#address-object
 */
export default function convertEnvelope(smtpEnvelope: SMTPServerEnvelope): Envelope {
  const envelope: Envelope = {};

  if (smtpEnvelope.mailFrom !== false && smtpEnvelope.mailFrom) {
    envelope.from = smtpEnvelope.mailFrom.address;
  }

  if (smtpEnvelope.rcptTo && smtpEnvelope.rcptTo.length > 0) {
    envelope.to = smtpEnvelope.rcptTo.map((address: SMTPServerAddress) => address.address).join(", ");
  }

  return envelope;
}
