import request from 'supertest';

import { startMetricsEndpoint, handleMetrics } from '../../src/lib/routes.js';
import { Server } from 'http';
import { initializeMetrics } from '../../src/lib/metrics.js';
import { logger } from '../../src/lib/logger.js';

jest.mock('../../src/lib/logger.js');

describe('Metrics Endpoint', () => {
  let app: Server;

  beforeAll(() => {
    initializeMetrics();
    app = startMetricsEndpoint();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    app.close();
  });

  it('should expose the metrics endpoint on port 8080', async () => {
    const response = await request("localhost:8080").get('/metrics');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/text\/plain/);
    expect(response.text).toBeDefined();
    expect(response.text).toContain("process_cpu_user_seconds_total");
  });

  it('should handle error and log it', async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const getMetricsRegistryMock = {
      contentType: 'application/json',
      metrics: jest.fn().mockRejectedValue(new Error('Test error')),
    };

    await handleMetrics(getMetricsRegistryMock, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(logger.error).toHaveBeenCalledWith('Failed getting Outgoer metrics');
  });
});
