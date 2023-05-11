import bunyan from 'bunyan';

export const logger = bunyan.createLogger({
  name: 'Outgoer',
  level: 'info', // Set the minimum level for logging

  streams: [
    {
      level: 'error',
      stream: process.stderr // Output to the standard error stream
    },
    {
      level: 'warn',
      stream: process.stdout // Output to the standard output stream
    },
    {
      level: 'info',
      stream: process.stdout // Output to the standard output stream
    }
  ]
});