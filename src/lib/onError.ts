export async function handleError(err: Error | undefined) {
    const error = err ?? { name: 'Undefined', message: 'undefined' };
    console.log('Error Name: %s, Message: %s', error.name, error.message);
}