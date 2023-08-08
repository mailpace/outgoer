import selectService from '../../src/lib/selectService.js';
import { EmailConfiguration } from '../../src/interfaces/config.js';

type ServiceSettings = EmailConfiguration['services'];

const priorityTwo: EmailConfiguration['services'][number] = {
  provider: 'smtp',
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
  name: 'Service 1',
};
const priorityThree: EmailConfiguration['services'][number] = {
  provider: 'mailpace',
  priority: 3,
  limit: 200,
  name: 'Service 2',
};
const priorityOne: EmailConfiguration['services'][number] = {
  provider: 'smtp',
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
  name: 'Service 3',
};

const services: ServiceSettings = [priorityThree, priorityTwo, priorityOne];

describe('selectService', () => {
  test('should return the highest priority service when no services have been attempted', () => {
    const attemptedProviders = {};
    const result = selectService(services, attemptedProviders);
    expect(result).toEqual(priorityOne);
  });

  test('should return the highest priority service excluding the attempted providers with more than 5 attempts', () => {
    const attemptedProviders = {'Service 3': {attempts: 6}, 'Service 2': {attempts: 6}};
    const result = selectService(services, attemptedProviders);
    expect(result).toEqual(priorityTwo);
  });

  test('should return undefined when all have been attempted', () => {
    const attemptedProviders = {'Service 3': {attempts: 6}, 'Service 2': {attempts: 6}, 'Service 1': {attempts: 6}};
    const result = selectService(services, attemptedProviders);
    expect(result).toBeUndefined();
  });

  test('should return undefined when services array is empty', () => {
    const services: ServiceSettings = [];
    const attemptedProviders = {};
    const result = selectService(services, attemptedProviders);
    expect(result).toBeUndefined();
  });
  
  test('should return the only available service when only one service is present', () => {
    const services: ServiceSettings = [priorityOne];
    const attemptedProviders = {};
    const result = selectService(services, attemptedProviders);
    expect(result).toEqual(priorityOne);
  });
  
  test('should return the highest priority service when all attempted providers have less than 5 attempts', () => {
    const attemptedProviders = {'Service 1': {attempts: 2}, 'Service 2': {attempts: 3}};
    const result = selectService(services, attemptedProviders);
    expect(result).toEqual(priorityOne);
  });
});
