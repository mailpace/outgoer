// import { authenticate } from '../lib/onAuth';
import { handleStream } from '../hooks/onData.js';

// Config should also be stored in:
// - env vars
// - local file
// - database/set by UI

export default {
  name: 'smtp.outgoer',
  secure: false,
  serverHost: 'localhost',
  authMethods: ['PLAIN', 'LOGIN'],
  authOptional: true,
  // onAuth: authenticate,
  onData: handleStream,
  size: 30 * 1024 * 1024, // 30 MB default limit
};