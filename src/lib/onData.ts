import {
  SMTPServerAuthenticationResponse,
  SMTPServerDataStream,
  SMTPServerSession,
} from 'smtp-server';

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
    response?: SMTPServerAuthenticationResponse | string
  ) => void
) {

  stream.on('end', () => {
    if (stream.sizeExceeded) {
      const err = new Error(`Message exceeds fixed maximum message size. Session id: ${session.id}`);
      return callback(err);
    }
  });

  return callback(null, "Message queued");
}
