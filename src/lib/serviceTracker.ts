import { Redis } from "ioredis";
import appConfig from '../config/index.js';

const redisClient = new Redis(
  appConfig.redis
);

const SERVICES: { name: string; limit?: number }[] = getServices();

export async function incrementSenderSent(serviceName: string, client = redisClient): Promise<void> {
  const service = SERVICES.find((s) => s.name === serviceName);

  if (!service) {
    throw new Error(`Service ${serviceName} not found in the configuration.`);
  }

  if (service.limit !== undefined) {
    const key = `sent_emails:${serviceName}`;
    const count = await client.incr(key);
    if (count > service.limit!) {
      throw new Error(
        `Service ${serviceName} has exceeded the limit of ${service.limit} emails.`,
      );
    }
  } else {
    // No, no limits, we'll reach for the sky
    client.incr(`sent_emails:${serviceName}`);
  }
}

export function getServices(): Array<{ name: string; limit?: number }> {
  return appConfig.services.map((service) => ({
    name: service.name,
    limit: service.limit,
  }));
}
