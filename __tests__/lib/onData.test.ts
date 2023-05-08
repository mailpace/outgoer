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
    expect(mockCallback).toHaveBeenCalledWith(null, "Message queued");
  });

  // TODO: add a test that covers the "end" sizeexceeded callback
});
