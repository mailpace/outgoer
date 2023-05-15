
import { EmailConfiguration } from '../interfaces/config.js';
type ServiceSettings = EmailConfiguration['services'][number];


/**
 * This selects the highest priority service, based on the priority integer
 * It also filters out any previous providers in the attemptedProviders array
 */
export default function selectService(services: Array<ServiceSettings>, attemptedProviders: Array<string>): ServiceSettings | undefined {
    const sorted = services.sort((a, b) => a.priority - b.priority); //sort by priority integer
    if (attemptedProviders && attemptedProviders.length > 0) {
      const availableServices = sorted.filter(service => !attemptedProviders.includes(service.providerName)); // ignore previously attempted servers
      return availableServices[0];
    } else {
      return sorted[0]
    }
  }