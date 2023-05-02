import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence, Unsubscribe, User } from "firebase/auth";
import { getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage";

const clientCredentials = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(clientCredentials);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth,browserLocalPersistence);

export const db = getFirestore(app);

export let authInitialized = false;
export function onFirebaseInit(callback : (user: User) => void) {
    if (authInitialized) {
        callback(auth.currentUser);
    }
    else {
        let unsub : Unsubscribe = null;
        unsub = auth.onAuthStateChanged(user => {
            callback(user);
            unsub();
        });
    }
}

export function waitForFirebaseInit() : Promise<User> {
    return new Promise((resolve, reject) => {
        onFirebaseInit(user => {
            resolve(user);
        });
    });
}

var unsub : Unsubscribe = null;

unsub = auth.onAuthStateChanged(user => {
    authInitialized = true;
    unsub();
});

export const storage = getStorage(app);