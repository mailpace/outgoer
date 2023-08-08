import SMTPTransport from '../../../src/lib/transports/smtp.js';

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
});
