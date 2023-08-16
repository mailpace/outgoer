import { createTransport } from '../../../src/lib/transports/index.js';

jest.mock('../../../src/lib/transports/smtp.js', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMail: jest.fn(),
    };
  });
});

jest.mock('../../../src/lib/transports/mailpace.js', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMail: jest.fn(),
    };
  });
});

describe('createTransport', () => {
  it('should return an SMTPTransport when given an SMTP service', () => {
    const service = {
      name: 'test',
      priority: 1,
      provider: 'smtp',
      smtpSettings: {
        host: 'localhost',
        port: 1025,
        secure: false,
      },
    };
    const transport = createTransport(service);
    expect(transport).toBeDefined();
    expect(transport.sendMail).toBeDefined();
  });

  it('should return a MailPaceTransport when given a MailPace service', () => {
    const service = {
      name: 'test',
      priority: 1,
      provider: 'mailpace',
      api_key: 'test',
    };
    const transport = createTransport(service);
    expect(transport).toBeDefined();
    expect(transport.sendMail).toBeDefined();
  });

  it('should throw an error when given an unsupported service', () => {
    const service = {
      name: 'test',
      priority: 1,
      provider: 'unsupported',
    };
    expect(() => createTransport(service)).toThrow();
  });
});
