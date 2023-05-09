import { ParsedMail, simpleParser, SimpleParserOptions } from 'mailparser';
import {
  SMTPServerAuthenticationResponse,
  SMTPServerDataStream,
  SMTPServerSession,
} from 'smtp-server';

import { enqueueEmail } from '../lib/emailQueue.js';
import { streamToRaw } from '../lib/rawMessageBuilder.js';

/**
 * Process stream from SMTP Server
 *
 * @param stream
 * @param session
 * @param callback
 *
 * @returns void
 */
export async function handleStream(
  stream: SMTPServerDataStream,
  session: SMTPServerSession,
  callback: (
    err: Error | null | undefined,
    response?: SMTPServerAuthenticationResponse | string,
  ) => void,
) {
  const raw = await streamToRaw(stream).catch((error: Error) => {
    callback(error);
    return raw;
  });

  // Options are set to preserve the original email where possible
  const options: SimpleParserOptions = {
    skipHtmlToText: true,
    maxHtmlLengthToParse: 10 * 1024 * 1024, // 15 MB TODO: make configurable
    skipImageLinks: true,
    skipTextToHtml: true,
    skipTextLinks: true,
  };

  const parsed: ParsedMail = await simpleParser(raw, options).catch(
    (error: Error) => {
      callback(error);
      return parsed;
    },
  );

  await enqueueEmail(raw, {
    to: parsed.to,
    from: parsed.from,
    subject: parsed.subject,
  });

  stream.on('end', () => {
    if (stream.sizeExceeded) {
      const err = new Error(
        `Message exceeds fixed maximum message size. Session id: ${session.id}`,
      );
      return callback(err);
    }
  });

  return callback(null, 'Message queued');
}
