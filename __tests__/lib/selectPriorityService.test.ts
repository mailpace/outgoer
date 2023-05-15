import selectService from '../../src/lib/selectPriorityService.js';
import { EmailConfiguration } from '../../src/interfaces/config.js';

type ServiceSettings = EmailConfiguration['services'];

const priorityTwo: EmailConfiguration['services'][number] = {
  type: 'smtp',
  priority: 2,
  limit: 100,
  smtpSettings: {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'username',
      pass: 'password',
    },
  },
  providerName: 'Service 1',
};
const priorityThree: EmailConfiguration['services'][number] = {
  type: 'library',
  priority: 3,
  limit: 200,
  providerName: 'Service 2',
};
const priorityOne: EmailConfiguration['services'][number] = {
  type: 'smtp',
  priority: 1,
  limit: 300,
  smtpSettings: {
    host: 'smtp.provider.com',
    port: 465,
    secure: true,
    auth: {
      user: 'username',
      pass: 'password',
    },
  },
  providerName: 'Service 3',
};

const services: ServiceSettings = [priorityThree, priorityTwo, priorityOne];

describe('selectService', () => {
  test('should return the highest priority service when no services have been attempted', () => {
    const attemptedProviders = [];
    const result = selectService(services, attemptedProviders);
    expect(result).toEqual(priorityOne);
  });

  test('should return the highest priority service excluding the attempted providers', () => {
    const attemptedProviders = ['Service 3', 'Service 2'];
    const result = selectService(services, attemptedProviders);
    expect(result).toEqual(priorityTwo);
  });

  test('should return the highest priority service even when all services have been attempted', () => {
    const attemptedProviders = ['Service 1', 'Service 2', 'Service 3'];
    const result = selectService(services, attemptedProviders);
    expect(result).toEqual(undefined);
  });
});
