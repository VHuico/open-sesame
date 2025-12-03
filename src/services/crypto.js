// src/services/crypto.js

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // Standard for AES-GCM
const KEY_LENGTH = 256;

/**
 * Generates a random salt.
 * @returns {Uint8Array}
 */
export const generateSalt = () => {
    return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
};

/**
 * Derives a key from a password and salt using PBKDF2.
 * @param {string} password
 * @param {string|Uint8Array} customSalt - Optional custom salt (e.g. email) or Uint8Array
 * @returns {Promise<{key: CryptoKey, salt: Uint8Array}>}
 */
export const deriveKey = async (password, customSalt = null) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    let salt;
    if (customSalt) {
        // Use custom salt (e.g. email) - deterministic
        if (typeof customSalt === 'string') {
            salt = enc.encode(customSalt);
        } else {
            salt = customSalt;
        }
    } else {
        // Generate random salt
        salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    }

    const key = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: KEY_LENGTH },
        false, // Key is not extractable
        ["encrypt", "decrypt"]
    );

    return { key, salt };
};

export const encryptData = async (data, key) => {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        enc.encode(data)
    );

    return { iv, ciphertext };
};

/**
 * Decrypts data using AES-GCM.
 * @param {ArrayBuffer} ciphertext
 * @param {Uint8Array} iv
 * @param {CryptoKey} key
 * @returns {Promise<string>}
 */
export const decryptData = async (ciphertext, iv, key) => {
    const dec = new TextDecoder();
    const plaintext = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        ciphertext
    );

    return dec.decode(plaintext);
};

// Helper to convert buffers to base64 for storage
export const bufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// Helper to convert base64 to buffer
export const base64ToBuffer = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};
