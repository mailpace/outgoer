// Mock implementation that overrides Auth
// For real world auth use cases, use this to configure a custom authentication implementation
function onAuth(_auth, _session, callback) {
  return callback(null, { user: 'test' });
}

export default onAuth;
