import appConfig from '../../src/config/index.js';

/**  Mock the JSON configuration file
jest.mock('../../config/test.json', () => ({
  outgoerSmtpServer: {
    port: 1000, // Mocked value for the 'secure' option
  },
}));
*/


describe('emailConfig', () => {
  it('should set the default email configuration options', () => {
    expect(appConfig.outgoerSmtpServer.name).toEqual('smtp.outgoer')
  });
  it('should override the default options if a JSON config file is available', () => {
    // expect(config.outgoerSmtpServer.port).toEqual(1000);
  });
});
