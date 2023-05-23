import express from 'express';
import Arena from 'bull-arena';
import { Queue } from 'bullmq';

import appConfig from '../config/index.js';
import { logger } from '../lib/logger.js';
import { getMetricsRegistry } from './metrics.js';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { SEND_QUEUE_NAME } from './emailQueue.js';

const router = express.Router();

router.get(appConfig.dashboard.metricsPath, (_req, res) => {
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
          host: appConfig.redis.host,
          port: appConfig.redis.port
        }
      },
    ],
  },
  {
    basePath: appConfig.dashboard.dashboardPath,
    disableListen: true,
  },
);

export function startMetricsEndpoint(): Server<
  typeof IncomingMessage,
  typeof ServerResponse
> {
  const app = express();
  const port = appConfig.dashboard.port;
  const host = appConfig.dashboard.host;

  router.use(arena);
  app.use(router);

  return app.listen(port, host, () => {
    logger.info(
      `Outgoer metrics endpoint available at http://${host}:${port}${appConfig.dashboard.metricsPath}.
      Outgoer dashboard available at http://${host}:${port}${appConfig.dashboard.dashboardPath}/`,
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
