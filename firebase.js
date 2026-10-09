```javascript
// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    initializeFirestore,
    persistentLocalCache
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
    authDomain: "inlact.firebaseapp.com",
    projectId: "inlact",
    storageBucket: "inlact.firebasestorage.app",
    messagingSenderId: "143868382036",
    appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};


const app = initializeApp(firebaseConfig);


// Firestore: conservamos la configuración actual
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
    experimentalForceLongPolling: true
});


// Autenticación de usuarios
export const auth = getAuth(app);
console.log("Firebase inicializado:", { db, auth });
```
