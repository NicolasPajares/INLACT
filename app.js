/********************************
 * 🔥 FIREBASE (IMPORTS PRIMERO)
 ********************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/********************************
 * ⚙️ CONFIG FIREBASE
 ********************************/
const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.appspot.com",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Firebase inicializado correctamente");

/********************************
 * 🧪 TEST FIRESTORE
 ********************************/
getDocs(collection(db, "clientes"))
  .then(snapshot => {
    console.log("✅ Firestore conectado. Clientes:");
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  })
  .catch(err => {
    console.error("❌ Error Firestore:", err);
    alert("Error Firestore: " + err.message);
  });

/********************************
 * 🚨 CAPTURA DE ERRORES (AL FINAL)
 ********************************/
window.onerror = function (msg, url, line, col) {
  alert(
    "ERROR:\n" +
    msg +
    "\nLinea: " + line +
    "\nColumna: " + col
  );
};
