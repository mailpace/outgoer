import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

let registry: Registry;
let emailsSentCounter: Counter<'status'>;

export function initializeMetrics() {
  registry = new Registry();

  collectDefaultMetrics({ register: registry });

  emailsSentCounter = new Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails sent',
    labelNames: ['status'],
    registers: [registry],
  });
}

export function incrementEmailsSent(status = 'success') {
  emailsSentCounter.inc({ status });
}

export function getMetricsRegistry(): Registry {
  return registry;
}
