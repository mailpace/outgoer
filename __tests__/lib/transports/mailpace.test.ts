import fs from 'fs';
import { HeaderValue, ParsedMail, simpleParser } from 'mailparser';
import MailPaceTransport, {
  formatAttachments,
  formatMessage,
  formatTags,
} from '../../../src/lib/transports/mailpace.js';
import { DomainClient } from '@mailpace/mailpace.js';

const RAW_EMAIL =
  'Content-Type: text/plain; charset=utf-8\r\nFrom: test@example.com\r\nTo: forward@example.com\r\nSubject: Test Email\r\nMessage-ID: <5da1bf4e-c641-b1a8-bc7a-2a253a8de71d@example.com>\r\nContent-Transfer-Encoding: 7bit\r\nDate: Fri, 11 Aug 2023 08:42:17 +0000\r\nMIME-Version: 1.0\r\n\r\nThis is a test email.\r\n';
const PARSED_EMAIL: ParsedMail = {
  attachments: [],
  headers: new Map(),
  headerLines: [],
  html: '',
  to: {
    value: [],
    text: 'to@a.com',
    html: '<>',
  },
  from: {
    value: [],
    text: 'from@b.com',
    html: '<>',
  },
};

const COMPLEX_EMAIL: ParsedMail = {
  attachments: [
    {
      contentType: 'application/pdf',
      contentDisposition: 'attachment',
      filename: 'test.pdf',
      checksum: 'test',
      contentId: 'test',
      related: false,
      cid: 'test',
      content: Buffer.from('test'),
      headerLines: [],
      headers: new Map(),
      type: 'attachment',
      size: 0,
    },
  ],
  headers: new Map(),
  headerLines: [],
  html: '<>',
  to: [
    {
      value: [],
      text: '',
      html: '',
    },
  ],
  from: {
    value: [],
    text: '',
    html: '',
  },
  text: '',
  subject: '',
  cc: [
    {
      value: [],
      text: '',
      html: '',
    },
  ],
  bcc: [
    {
      value: [],
      text: '',
      html: '',
    },
  ],
  replyTo: {
    value: [],
    text: '',
    html: '',
  },
};

jest.mock('@mailpace/mailpace.js', () => ({
  DomainClient: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn().mockResolvedValue({
      id: 'test',
      status: 'success',
    }),
  })),
}));

describe('MailPaceTransport', () => {
  it('should implement the Transport interface', () => {
    const transport = new MailPaceTransport('test');
    expect(transport).toBeDefined();
    expect(transport.sendMail).toBeDefined();
  });

  it('should send an email', async () => {
    const transport = new MailPaceTransport('placeholder-api-key');
    const email = {
      raw: RAW_EMAIL,
      envelope: {},
    };
    const sent = await transport.sendMail(email);
    expect(sent.messageId).toBe('test');
    expect(sent.response).toBe('success');
  });

  it('should handle error in sendMail', async () => {
    // Override the mock to return an error for this test only
    DomainClient.prototype.sendEmail = jest
      .fn()
      .mockRejectedValue(new Error('test'));
    const transport = new MailPaceTransport('test');
    const email = {
      raw: 'test',
      envelope: {},
    };
    const sent = await transport.sendMail(email);
    expect(sent.messageId).toBe('');
  });
});

describe('formatMessage', () => {
  it('should format a message to the MailPace format', () => {
    const message = formatMessage(PARSED_EMAIL);
    expect(message.to).toBe('to@a.com');
    expect(message.from).toBe('from@b.com');
  });

  it('ignores list unsubscribe if not specified', () => {
    const mockParsedEmail: ParsedMail = {
      attachments: [],
      headers: new Map(),
      headerLines: [],
      html: '',
      from: {
        value: [],
        text: 'from@b.com',
        html: '<>',
      },
    };
    const message = formatMessage(mockParsedEmail);
    expect('list_unsubscribe' in message).toBe(false);
  });

  it('converts attachments into oms format', async () => {
    const email = await simpleParser(
      fs.createReadStream(__dirname + '/../../fixtures/attachment.eml'),
    );
    const attachments = formatAttachments(email.attachments);
    expect(attachments.length).toBe(1);
    expect(typeof attachments[0].content).toBe('string'); //base64
    expect(attachments[0].content_type).toBe('application/pdf');
  });

  test('handles multiple mailpace tags', async () => {
    const email = await simpleParser(
      fs.createReadStream(
        __dirname + '/../../fixtures/mailpace/mailpace_tags.eml',
      ),
    );
    const message = formatMessage(email);
    expect(message.tags).toEqual(['tag mailpace one', 'tag mailpace two']);
  });

  test('handles no tags', async () => {
    const email = await simpleParser(
      fs.createReadStream(__dirname + '/../../fixtures/mailpace/no_tags.eml'),
    );
    const message = formatMessage(email);
    expect(message.tags).toEqual([]);
  });

  test('handles list unsubscribe', async () => {
    const email = await simpleParser(
      fs.createReadStream(
        __dirname + '/../../fixtures/mailpace/list_unsubscribe.eml',
      ),
    );
    const message = formatMessage(email);
    expect(message.list_unsubscribe).toEqual(
      '<http://www.host.com/list.cgi?cmd=unsub&lst=list>, <mailto:list-request@host.com?subject=unsubscribe>',
    );
  });

  test('formats complex email', async () => {
    const message = formatMessage(COMPLEX_EMAIL);
    expect(message.attachments).toEqual([
      {
        cid: 'test',
        content_type: 'application/pdf',
        content: 'dGVzdA==',
        name: 'test.pdf',
      },
    ]);
  });

  test('handles single bcc and cc', () => {
    const transformedEmail: ParsedMail = {
      ...COMPLEX_EMAIL,
      cc: { value: [], text: 'cc@test.com', html: '' },
      bcc: {value: [], text: 'bcc@test.com', html: ''},
    };
    const message = formatMessage(transformedEmail);
    expect(message.cc).toEqual('cc@test.com');
    expect(message.bcc).toEqual('bcc@test.com');
  });
});

describe('formatTags', () => {
  it('should handle an array of tags', () => {
    const tags: HeaderValue = [' tag1 ', ' tag2 ', ' tag3 '];
    const result = formatTags(tags);
    expect(result).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('should handle a string of comma-separated tags', () => {
    const tags: HeaderValue = 'tag1, tag2, tag3';
    const result = formatTags(tags);
    expect(result).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('should handle a string with a single tag', () => {
    const tags: HeaderValue = 'tag';
    const result = formatTags(tags);
    expect(result).toEqual(['tag']);
  });

  it('should handle an empty array', () => {
    const tags: HeaderValue = [];
    const result = formatTags(tags);
    expect(result).toEqual([]);
  });

  it('should handle an undefined value', () => {
    const tags: HeaderValue = undefined;
    const result = formatTags(tags);
    expect(result).toEqual([]);
  });
});
