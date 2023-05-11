import request from 'supertest';

import { startMetricsEndpoint } from '../../src/lib/routes.js';
import { Server } from 'http';
import { initializeMetrics } from '../../src/lib/metrics.js';

describe('Metrics Endpoint', () => {
  let app: Server;

  beforeAll(() => {
    initializeMetrics();
    app = startMetricsEndpoint();
  });

  afterAll(() => {
    app.close();
  });

  it('should expose the metrics endpoint on port 8080', async () => {
    const response = await request("localhost:8080").get('/metrics');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/text\/plain/);
    expect(response.text).toBeDefined();
  });
});
