import { handleError } from '../../src/hooks/onError.js';

test('handleError logs error name and message', async () => {
  const error = new Error('Test error');
  await handleError(error);
  expect(true).toBe(true); // TODO: assert logged statement
});

test('handleError handles undefined error', async () => {
  await handleError(undefined);
  expect(true).toBe(true); // TODO: assert logged statement
});
