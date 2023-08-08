import Mail from "nodemailer/lib/mailer/index.js";

export interface Transport {
  sendMail: (email: RawEmail) => Promise<SentMessage>;
}

// Used by SMTP Provider
// We do not define types for Emails as they are defined by the individual client libraries
export interface RawEmail {
  raw: string;
  envelope: Mail.Envelope;
}

export interface SentMessage {
  messageId: string;
  response: string;
  responseCode?: number;
  error?: Error;
}