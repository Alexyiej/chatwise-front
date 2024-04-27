import { readKey } from "./storage";



export async function generateDHKeys() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-384" 
        },
        true,
        ["deriveKey"]
    );

    return {
        publicKey: await window.crypto.subtle.exportKey("raw", keyPair.publicKey),
        privateKey: keyPair.privateKey
    };
}



export async function deriveSecretKey(publicKeyBuffer) {
    const userName = localStorage.getItem('username');
	const privateKey = await readKey(`private_key:${userName}`);
    const importedPublicKey = await window.crypto.subtle.importKey(
        "raw",
        publicKeyBuffer, 
        { name: "ECDH", namedCurve: "P-384" },
        true,
        []
    );
    
    const secretKey = await window.crypto.subtle.deriveKey(
        { name: "ECDH", public: importedPublicKey },
        privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    return secretKey;
}
