import { readKey } from "./storage";


async function encryptMessage(message, chatId) {
    try {
        const encoder = new TextEncoder();
        const encodedMessage = encoder.encode(message);

        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv, 
            },
            await readKey(`secret_key_${chatId}`),
            encodedMessage
        );

        return {
            encrypted: encrypted,
            iv: iv  
        };

    } catch (error) {
        console.error("Encryption failed:", error);
        throw error;
    }
}


async function decryptMessage(encryptedData, iv, chatId) {
    try {
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv  
            },
            await readKey(`secret_key_${chatId}`), 
            encryptedData
        );

        const decoder = new TextDecoder();
        const decryptedMessage = decoder.decode(decryptedData);
        
        return decryptedMessage;

    } catch (error) {
        console.error('Error during decryption:', error);
        throw error;
    }
}


export { encryptMessage, decryptMessage };