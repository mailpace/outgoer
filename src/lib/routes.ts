import express from 'express';
import Arena from 'bull-arena';
import { Queue } from 'bullmq';

import config from '../config/index.js';
import { logger } from '../lib/logger.js';
import { getMetricsRegistry } from './metrics.js';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { SEND_QUEUE_NAME } from './emailQueue.js';

const router = express.Router();

router.get(config.dashboard.metricsPath, (_req, res) => {
  res.set('Content-Type', getMetricsRegistry().contentType);
  handleMetrics(getMetricsRegistry(), res);
});

const arena = Arena(
  {
    BullMQ: Queue,
    queues: [
      {
        name: SEND_QUEUE_NAME,
        hostId: 'Outgoer Send Queue', // User-readable display name for the host. Required.
        type: 'bullmq',
        redis: {
          host: config.redis.host,
          port: config.redis.port
        }
      },
    ],
  },
  {
    basePath: config.dashboard.dashboardPath,
    disableListen: true,
  },
);

export function startMetricsEndpoint(): Server<
  typeof IncomingMessage,
  typeof ServerResponse
> {
  const app = express();
  const port = config.dashboard.port;
  const host = config.dashboard.host;

  router.use(arena);
  app.use(router);

  return app.listen(port, host, () => {
    logger.info(
      `Outgoer metrics endpoint available at http://${host}:${port}${config.dashboard.metricsPath}.
      Outgoer dashboard available at http://${host}:${port}${config.dashboard.dashboardPath}/`,
    );
  });
}

export function handleMetrics(metricsRegistry, res) {
  return metricsRegistry
    .metrics()
    .then((metrics) => {
      res.send(metrics);
    })
    .catch(function () {
      logger.error('Failed getting Outgoer metrics');
      res.status(500);
    });
}
