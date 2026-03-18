const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

const keysPath = path.join(__dirname, 'keys');

if (!fs.existsSync(keysPath)) {
    fs.mkdirSync(keysPath);
}

fs.writeFileSync(path.join(keysPath, 'private.pem'), privateKey, { flag: 'w' });
fs.writeFileSync(path.join(keysPath, 'public.pem'), publicKey, { flag: 'w' });

console.log('RSA 2048 keys created!');