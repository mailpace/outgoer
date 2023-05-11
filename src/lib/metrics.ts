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

// Function to increment the emails sent counter
export function incrementEmailsSent(status: string = 'success') {
  emailsSentCounter.inc({ status });
}

// Function to get the metrics registry
export function getMetricsRegistry(): Registry {
  return registry;
}
