export default function () {
    return {
      serverHost: '0.0.0.0',
      key: Buffer.from(process.env.PRIVATEKEY, 'base64').toString('ascii'),
      cert: Buffer.from(process.env.FULLCHAIN, 'base64').toString('ascii'),
    };
  }