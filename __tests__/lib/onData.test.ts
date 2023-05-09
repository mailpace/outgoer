import { mock } from 'jest-mock-extended';
import nodemailer from 'nodemailer';
import { SMTPServerDataStream, SMTPServerSession } from 'smtp-server';
import { handleStream } from '../../src/lib/onData.js';
import { Readable } from 'stream';


describe('handleStream', () => {  
  it('should handle the stream and return a successful response', async () => {
    const mockSession = mock<SMTPServerSession>();
    const mockDataStream = mock<SMTPServerDataStream>();
    const mockCallback = jest.fn();

    // Use nodemailer to create an email stream
    const transport = nodemailer.createTransport({ streamTransport: true });
    const info = await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: 'bar@example.com, baz@example.com',
    });

    if (Buffer.isBuffer(info.message)) {
      // if message is a buffer, convert it to a readable stream
      const messageStream = new Readable();
      messageStream.push(info.message);
      messageStream.push(null);
      messageStream.pipe(mockDataStream);
    } else {
      // if message is already a readable stream, just pipe it to rawStream
      info.message.pipe(mockDataStream);
    }


  
    await handleStream(mockDataStream, mockSession, mockCallback);

 
    expect(mockDataStream.on).toHaveBeenCalledWith('end', expect.any(Function));
    expect(mockCallback).toHaveBeenCalledWith(null, "Message queued");
  });

  // TODO: add a test that covers the "end" sizeexceeded callback
});
