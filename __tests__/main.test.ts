import start from '../src/main.js';

jest.mock('smtp-server', () => ({
  SMTPServer: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    listen: jest.fn(),
  })),
}));

jest.mock('../src/lib/logger.js', () => ({
  logger: {
    info: jest.fn(),
  },
}));

jest.mock('../src/config/index.js', () =>({
    outgoerSmtpServer: {
        name: "test server"
    }
}));

jest.mock('../src/lib/metrics.js', () => ({
  initializeMetrics: jest.fn(),
}));

jest.mock('../src/lib/routes.js', () => ({
  startMetricsEndpoint: jest.fn(),
}));

jest.mock('../src/hooks/onError.js', () => ({
  handleError: jest.fn(),
}));

jest.mock('../src/lib/emailQueue.js', () => ({
  initializeQueue: jest.fn(),
}));

jest.mock('../src/workers/sender.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/workers/reset.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Server Module Unit Test', () => {
  beforeEach(() => {
    // Clear mock calls and instances before each test to avoid interference between tests.
    jest.clearAllMocks();
  });

  it('should initialize the SMTP server and other components correctly', () => {
    start();

    /* eslint-disable @typescript-eslint/no-var-requires */
    expect(require('smtp-server').SMTPServer).toHaveBeenCalledTimes(1);
    expect(require('../src/lib/logger.js').logger.info).toHaveBeenCalled();
    
    expect(require('../src/lib/logger.js').logger.info).toHaveBeenCalledWith(
      expect.stringContaining('SMTP server and Dashboard...')
    );
    expect(require('../src/lib/metrics.js').initializeMetrics).toHaveBeenCalledTimes(1);
    expect(require('../src/lib/routes.js').startMetricsEndpoint).toHaveBeenCalledTimes(1);
    expect(require('../src/lib/emailQueue.js').initializeQueue).toHaveBeenCalledTimes(1);
    expect(require('../src/workers/sender.js').default).toHaveBeenCalledTimes(1);
    expect(require('../src/workers/reset.js').default).toHaveBeenCalledTimes(1);
    /* eslint-enable @typescript-eslint/no-var-requires */
  });
});
