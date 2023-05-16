import { SMTPServerEnvelope } from 'smtp-server';
import convertEnvelope from '../../src/lib/convertEnvelope.js';

describe('convertEnvelope', () => {
  test('should convert SMTPServerEnvelope with valid data', () => {
    const smtpEnvelope = {
      mailFrom: {
        address: 'sender@example.com',
        args: {}
      },
      rcptTo: [
        {
          address: 'recipient1@example.com',
          args: {}
        },
        {
          address: 'recipient2@example.com',
          args: {}
        },
        {
          address: 'recipient3@example.com',
          args: {}
        }
      ]
    };

    const expectedEnvelope = {
      from: 'sender@example.com',
      to: 'recipient1@example.com, recipient2@example.com, recipient3@example.com'
    };

    const convertedEnvelope = convertEnvelope(smtpEnvelope);
    expect(convertedEnvelope).toEqual(expectedEnvelope);
  });

  test('should convert SMTPServerEnvelope with no mailFrom', () => {
    const smtpEnvelope: SMTPServerEnvelope = {
      mailFrom: false,
      rcptTo: [
        {
          address: 'recipient1@example.com',
          args: {}
        }
      ]
    };

    const expectedEnvelope = {
      to: 'recipient1@example.com'
    };

    const convertedEnvelope = convertEnvelope(smtpEnvelope);
    expect(convertedEnvelope).toEqual(expectedEnvelope);
  });

  test('should convert SMTPServerEnvelope with empty rcptTo', () => {
    const smtpEnvelope = {
      mailFrom: {
        address: 'sender@example.com',
        args: {}
      },
      rcptTo: []
    };

    const expectedEnvelope = {
      from: 'sender@example.com'
    };

    const convertedEnvelope = convertEnvelope(smtpEnvelope);
    expect(convertedEnvelope).toEqual(expectedEnvelope);
  });

  test('should convert SMTPServerEnvelope with args (ignored)', () => {
    const smtpEnvelope = {
      mailFrom: {
        address: 'Sender Name <sender@example.com>',
        args: {
          foo: true
        }
      },
      rcptTo: [
        {
          address: 'recipient1@example.com',
          args: {
            bar: false
          }
        },
        {
          address: 'recipient2@example.com',
          args: {
            foo: true
          }
        }
      ]
    };

    const expectedEnvelope = {
      from: 'Sender Name <sender@example.com>',
      to: 'recipient1@example.com, recipient2@example.com'
    };

    const convertedEnvelope = convertEnvelope(smtpEnvelope);
    expect(convertedEnvelope).toEqual(expectedEnvelope);
  });
});
