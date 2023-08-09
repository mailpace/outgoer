import SMTPTransport from '../../../src/lib/transports/smtp.js';
import { RawEmail } from '../../../src/interfaces/transports.js';
import nodemailer from 'nodemailer';

// Mock for the nodemailer module that implements createTransport
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test',
      response: 'response',
    }),
  }),
}));

describe('SMTPTransport', () => {
  it('should implement the Transport interface', () => {
    const transport = new SMTPTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
    expect(transport).toBeDefined();
    expect(transport.sendMail).toBeDefined();
  });

  it('should send an email', async () => {
    const transport = new SMTPTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
    const email: RawEmail = { raw: 'test', envelope: {} };
    const sent = await transport.sendMail(email);
    expect(sent.messageId).toBe('test');
    expect(sent.response).toBe('response');
  });

  it('should handle error in sendMail', async () => {
    const email: RawEmail = { raw: 'test', envelope: {} };

    // Override the mock to return an error for this test only
    const sendMailMock = jest.fn().mockRejectedValue(new Error('test'));
    nodemailer.createTransport = jest.fn().mockReturnValue({
      sendMail: sendMailMock,
    });

    const transport = new SMTPTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
    });

    const sent = await transport.sendMail(email);
    expect(sent.messageId).toBe('');
    expect(sent.response).toBe('Error sending email');
    expect(sent.responseCode).toBe(500);
    expect(sent.error).toBeDefined();
    expect(sent.error?.message).toBe('test');
  });
});
