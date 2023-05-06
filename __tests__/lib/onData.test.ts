import { mock } from 'jest-mock-extended';
import { SMTPServerDataStream, SMTPServerSession } from 'smtp-server';
import { handleStream } from '../../src/lib/onData.js';


describe('handleStream', () => {  
  it('should handle the stream and return a successful response', async () => {
    const mockSession = mock<SMTPServerSession>();
    const mockDataStream = mock<SMTPServerDataStream>();
    const mockCallback = jest.fn();
    
    await handleStream(mockDataStream, mockSession, mockCallback);

    expect(mockDataStream.on).toHaveBeenCalledWith('end', expect.any(Function));
    expect(mockCallback).toHaveBeenCalledWith(null);
  });

  it('should handle the stream and return an error response if the message size is exceeded', async () => {
    const mockSession = mock<SMTPServerSession>();
    const mockDataStream = mock<SMTPServerDataStream>();

    mockDataStream.sizeExceeded = true;
    mockSession.id = "abc";

    const mockCallback = jest.fn();
    
    await handleStream(mockDataStream, mockSession, mockCallback);
    expect(mockDataStream.on).toHaveBeenCalledWith('end', expect.any(Function));

    await new Promise(resolve => process.nextTick(resolve));
  
    expect(mockCallback).toHaveBeenCalledWith(new Error('Message exceeds fixed maximum message size. Session id: abc'));
  });
});
