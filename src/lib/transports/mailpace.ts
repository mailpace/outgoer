import {
  Transport,
  SentMessage,
  RawEmail,
} from '../../interfaces/transports.js';
import { Attachment } from '@mailpace/mailpace.js/build/main/lib/models/Attachment.js';
import { Message } from '@mailpace/mailpace.js/build/main/lib/models/Message.js';

import { DomainClient }  from '@mailpace/mailpace.js';
import { HeaderValue, ParsedMail, simpleParser } from 'mailparser';

class MailPaceTransport implements Transport {
  private client: DomainClient;

  constructor(apiToken: string) {
    this.client = new DomainClient(apiToken);
  }

  sendMail: (email: RawEmail) => Promise<SentMessage> = async (
    email: RawEmail,
  ) => {
    try {
      const parsed = await simpleParser(email.raw, {});
      const formattedMessage = formatMessage(parsed);
      const message = await this.client.sendEmail(formattedMessage);
      return {
        messageId: message.id.toString(),
        response: message.status,
        responseCode: 200,
      };
      // TODO: handle 429 rate limiting errors, e.g. slow down retries

    } catch (error) {
      return {
        messageId: '',
        response: 'Failed to send email.',
        responseCode: 500,
        error: error,
      };
    }
  };
}

/**
 * Formats the request into the MailPace API format, originally from the MailPace SMTP Gateway
 *
 * @param parsedEmail from mailparser
 *
 * @returns MailPace.Message formatted object
 *
 */
export function formatMessage(parsedEmail: ParsedMail) {
  const attachments: ReadonlyArray<Attachment> = formatAttachments(
    parsedEmail.attachments,
  );

  const tags: ReadonlyArray<string> | string = formatTags(
    parsedEmail.headers.get('x-mailpace-tags')
  );

  function get_list_unsubscribe(): string {
    return parsedEmail.headers.get('x-list-unsubscribe').toString();
  }

  const email: Message = {
    ...(parsedEmail.to && {
      to: Array.isArray(parsedEmail.to)
        ? parsedEmail.to.map((addr) => addr.text).join(', ')
        : parsedEmail.to?.text,
    }),
    from: parsedEmail.from.text,
    ...(parsedEmail.html && { htmlbody: parsedEmail.html }),
    ...(parsedEmail.text && { textbody: parsedEmail.text }),
    ...(parsedEmail.subject && { subject: parsedEmail.subject }),
    ...(parsedEmail.cc && {
      cc: Array.isArray(parsedEmail.cc)
        ? parsedEmail.cc.map((addr) => addr.text).join(', ')
        : parsedEmail.cc?.text,
    }),
    ...(parsedEmail.bcc && {
      bcc: Array.isArray(parsedEmail.bcc)
        ? parsedEmail.bcc.map((addr) => addr.text).join(', ')
        : parsedEmail.bcc?.text,
    }),
    ...(parsedEmail.replyTo && { replyto: parsedEmail.replyTo.text }),
    ...(parsedEmail.headers.get('x-list-unsubscribe')
      ? { list_unsubscribe: get_list_unsubscribe() }
      : {}),
    ...(parsedEmail.attachments && { attachments: attachments }),
    tags,
  };

  return email;
}

/**
 * Turn attachments into MailPace API format
 */
export function formatAttachments(attachments): ReadonlyArray<Attachment> {
  return attachments.map((attachment) => {
    return {
      name: attachment.filename,
      content: attachment.content.toString('base64'),
      content_type: attachment.contentType,
      cid: attachment.cid ? attachment.cid : null,
    };
  });
}

/**
 * Extract tags from headers and convert to MailPace API format
 */
export function formatTags(tags: HeaderValue): ReadonlyArray<string> {
  if (Array.isArray(tags)) {
    return tags.map(tag => tag.trim());
  } else if (typeof tags === "string") {
    const split = tags.split(',');
    return split.map(tag => tag.trim());
  } else {
    return [];
  }
}

export default MailPaceTransport;
