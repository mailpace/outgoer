import { PassThrough, Readable } from 'stream';
import nodemailer from 'nodemailer';
import { streamToRaw } from '../../src/lib/rawMessageBuilder.js';

describe('convert stream to rfc string', () => {
  test('should convert stream to raw message', async () => {
    const transport = nodemailer.createTransport({ streamTransport: true });
    const info = await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: 'bar@example.com, baz@example.com',
    });

    const rawStream = new PassThrough();

    if (Buffer.isBuffer(info.message)) {
      // if message is a buffer, convert it to a readable stream
      const messageStream = new Readable();
      messageStream.push(info.message);
      messageStream.push(null);
      messageStream.pipe(rawStream);
    } else {
      // if message is already a readable stream, just pipe it to rawStream
      info.message.pipe(rawStream);
    }

    const raw = await streamToRaw(rawStream);

    expect(raw.length).toEqual(247);
  });

  test('should reject with error on stream error', async () => {
    const stream = new PassThrough();
    const errorMessage = 'Intentional error';
    process.nextTick(() => {
      stream.emit('error', new Error(errorMessage));
    });

    await expect(streamToRaw(stream)).rejects.toThrow(errorMessage);
  });
});
