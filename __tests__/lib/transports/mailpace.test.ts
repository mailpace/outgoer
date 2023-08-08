import MailPaceTransport from '../../../src/lib/transports/mailpace.js';

describe('MailPaceTransport', () => {
  it('should implement the Transport interface', () => {
    const transport = new MailPaceTransport('test');
    expect(transport).toBeDefined();
    expect(transport.sendMail).toBeDefined();
  });
});
