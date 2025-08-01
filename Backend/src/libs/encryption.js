import crypto from 'crypto';

// E2EE Configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Generate a new encryption key
export const generateKey = () => {
    return crypto.randomBytes(KEY_LENGTH);
};

// Generate a new key pair for asymmetric encryption
export const generateKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
};

// Encrypt data with AES-GCM
export const encrypt = (data, key) => {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipher(ALGORITHM, key);
        cipher.setAAD(Buffer.from('MichatE2EE', 'utf8'));
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    } catch (error) {
        throw new Error('Encryption failed: ' + error.message);
    }
};

// Decrypt data with AES-GCM
export const decrypt = (encryptedData, key, iv, tag) => {
    try {
        const decipher = crypto.createDecipher(ALGORITHM, key);
        decipher.setAAD(Buffer.from('MichatE2EE', 'utf8'));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
};

// Encrypt with public key (for key exchange)
export const encryptWithPublicKey = (data, publicKey) => {
    try {
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(data)
        );
        return encrypted.toString('base64');
    } catch (error) {
        throw new Error('Public key encryption failed: ' + error.message);
    }
};

// Decrypt with private key (for key exchange)
export const decryptWithPrivateKey = (encryptedData, privateKey) => {
    try {
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(encryptedData, 'base64')
        );
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error('Private key decryption failed: ' + error.message);
    }
};

// Generate session key for conversation
export const generateSessionKey = () => {
    return crypto.randomBytes(KEY_LENGTH).toString('base64');
};

// Hash data for integrity verification
export const hashData = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

// Verify data integrity
export const verifyIntegrity = (data, expectedHash) => {
    const actualHash = hashData(data);
    return crypto.timingSafeEqual(
        Buffer.from(actualHash, 'hex'),
        Buffer.from(expectedHash, 'hex')
    );
};

// Generate fingerprint for key verification
export const generateFingerprint = (publicKey) => {
    const hash = crypto.createHash('sha256').update(publicKey).digest('hex');
    return hash.match(/.{1,4}/g).join(':').toUpperCase();
};

// Secure random number generation
export const secureRandom = (min, max) => {
    const range = max - min;
    const bytes = crypto.randomBytes(4);
    const value = bytes.readUInt32BE(0);
    return min + (value % range);
};

// Key derivation function
export const deriveKey = (password, salt, iterations = 100000) => {
    return crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, 'sha256');
};

// Generate salt for key derivation
export const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex');
}; 