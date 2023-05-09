import { PassThrough } from 'stream';

import { handleError } from './onError.js';

export async function streamToRaw(stream: PassThrough): Promise<string> {
  let result = '';

  return new Promise(function (resolve, reject) {
    stream.on('data', function (chunk) {
      result += chunk;
    });

    stream.on('end', function () {
      resolve(result);
    });

    stream.on('error', function (err) {
      handleError(err);
      reject(err);
    });
  });
}