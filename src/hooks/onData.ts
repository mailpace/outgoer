// import { ParsedMail, simpleParser, SimpleParserOptions } from 'mailparser';
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
  const raw: string = await streamToRaw(stream).catch((error: Error) => {
    callback(error);
    return raw;
  });

  await enqueueEmail(raw, session.envelope);

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
