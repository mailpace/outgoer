import { EmailConfiguration } from '../interfaces/config.js';
import { EmailJobData } from '../interfaces/email.js';

type ServiceSettings = EmailConfiguration['services'][number];
type AttemptedProviders = EmailJobData['attemptedProviders'];

const MAX_SEND_ATTEMPTS_PER_PROVIDER: number = 5;

/**
 * This selects the highest priority service, based on the priority integer
 * and filter out any providers that have exceed max send attempts
 */
export default function selectService(
  services: Array<ServiceSettings>,
  attemptedProviders: AttemptedProviders,
): ServiceSettings | undefined {
  const sorted = services.sort((a, b) => a.priority - b.priority); // Sort by priority integer

  const filtered = sorted.find((service) => {
    const attempts = attemptedProviders[service.name]?.attempts || 0;
    return attempts < MAX_SEND_ATTEMPTS_PER_PROVIDER;
  });

  return filtered;
}