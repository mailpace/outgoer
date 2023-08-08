import { createTransport } from '../../../src/lib/transports/index.js';

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

  it('should throw an error when given an unsupported service', () => {
    const service = {
      name: 'test',
      priority: 1,
      provider: 'unsupported',
    };
    expect(() => createTransport(service)).toThrowError();
  });
});
