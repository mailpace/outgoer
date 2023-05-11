import { logger } from '../lib/logger.js';

export async function handleError(err: Error | undefined) {
    const error = err ?? { name: 'Undefined', message: 'undefined' };
    logger.error('Error Name: %s, Message: %s', error.name, error.message);
}