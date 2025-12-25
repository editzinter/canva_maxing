const crypto = require('crypto');

// Generate RSA key pair using Node's crypto module (more reliable)
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('=== PRIVATE KEY (for auth.ts) ===');
console.log(JSON.stringify(privateKey));
console.log('\n=== PUBLIC KEY (for jwks endpoint) ===');
console.log(JSON.stringify(publicKey));
