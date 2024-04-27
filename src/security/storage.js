import {apiClient} from 'api';
import { openDB } from 'idb';
import { toast } from 'react-toastify';



async function initDB() {
    const db = await openDB('CryptoDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('keys')) {
                db.createObjectStore('keys', { keyPath: 'id' });
            }
        }
    });
    return db;
}



export async function saveKey(id, key) {
    const db = await initDB();
    const tx = db.transaction('keys', 'readwrite');
    const store = tx.objectStore('keys');
    await store.put({ id: id, key: key });
    await tx.complete;

}



export async function readKey(id) {
    const db = await initDB();
    const tx = db.transaction('keys', 'readonly');
    const store = tx.objectStore('keys');
    const key = await store.get(id);

    if (key) return key.key; else return null;
}



export async function getPublicKey() {
	try {
		const response = await apiClient.get('/user/public_key');
		const publicKey = new Uint8Array(response.data);
		return publicKey;

	} catch (e) {
		const status = e.response.status;
		if (status === 404) return toast.error("Public key not found");
		
		toast.error("An error occurred while fetching the public key");
	  	return null; 
	}
}