import express from 'express';

import config from '../config/index.js';
import { logger } from '../lib/logger.js';
import { getMetricsRegistry } from './metrics.js';
import { IncomingMessage, Server, ServerResponse } from 'http';

export function startMetricsEndpoint(): Server<typeof IncomingMessage, typeof ServerResponse> {
  const app = express();
  const port = config.metrics.port;
  const path = config.metrics.path;

  app.get(`${path}`, (_req, res) => {
    res.set('Content-Type', getMetricsRegistry().contentType);
    handleMetrics(getMetricsRegistry(), res);
  });

  return app.listen(port, () => {
    logger.info(`Outgoer metrics endpoint available at ${path} on port ${port}`);
  });
}

export function handleMetrics(metricsRegistry, res) {
  return metricsRegistry.metrics()
    .then((metrics) => {
      res.send(metrics);

    })
    .catch(function () {
      logger.error('Failed getting Outgoer metrics');
      res.status(500);
    });
}
