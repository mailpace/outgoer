// Mock implementation that overrides Auth
// This should be overriden in production, through configuration
function onAuth(_auth, _session, callback) {
    return callback(null, { user: 'test' });
}

export default onAuth;
