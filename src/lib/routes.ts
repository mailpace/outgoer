import express from 'express';
import { logger } from '../lib/logger.js';
import { getMetricsRegistry } from './metrics.js';
import { IncomingMessage, Server, ServerResponse } from 'http';

export function startMetricsEndpoint(): Server<typeof IncomingMessage, typeof ServerResponse> {
  const app = express();
  const port = 8080; // TODO: make configurable

  app.get('/metrics', (_req, res) => { // TODO: make configurable
    res.set('Content-Type', getMetricsRegistry().contentType);
    res.send(getMetricsRegistry().metrics());
  });

  return app.listen(port, () => {
    logger.info(`Outgoer metrics endpoint available on port ${port}`);
  });
}
