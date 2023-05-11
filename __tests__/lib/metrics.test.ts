import { incrementEmailsSent, getMetricsRegistry, initializeMetrics } from '../../src/lib/metrics.js';

describe('Metrics Module', () => {
  beforeAll(() => {
    initializeMetrics();
  })

  beforeEach(() => {
    getMetricsRegistry().resetMetrics();
  });

  it('should increment the emails sent counter', async () => {
    incrementEmailsSent('failure');
    incrementEmailsSent('success');

    const registry = getMetricsRegistry();
    const metrics = await registry.getMetricsAsJSON();

    const counterMetric = metrics.find((metric: any) => metric.name === 'emails_sent_total');
    expect(counterMetric).toBeDefined();
    expect(counterMetric.values).toHaveLength(2);

    const successValue = counterMetric.values.find((value: any) => value.labels.status === 'success');
    const failureValue = counterMetric.values.find((value: any) => value.labels.status === 'failure');

    expect(successValue).toBeDefined();
    expect(successValue.value).toBe(1);

    expect(failureValue).toBeDefined();
    expect(failureValue.value).toBe(1);
  });

  it('should have default metrics', async () => {
    const registry = getMetricsRegistry();
    const metrics = await registry.getMetricsAsJSON();

    expect(metrics.length).toBeGreaterThan(10);
  });
});
