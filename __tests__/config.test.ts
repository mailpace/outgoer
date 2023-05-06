import config from '../src/config/index.js';

test('base configuration exists', () => {
  expect(config.base.default).toBeDefined();
});

test('production configuration exists', () => {
  expect(config.production.default).toBeDefined();
});

test('prod config throws an error when testing due to missing crt files', () => {
  expect(() => {
    config.production.default();
  }).toThrow();
});

test('development configuration exists', () => {
  expect(config.development.default).toBeDefined();
});

test('dev config is fine when called', () => {
  const dev = config.development.default();
  expect(dev.logger).toBeDefined();
});
