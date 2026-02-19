window.onerror = function (msg, url, line, col, error) {
  alert(
    "ERROR:\n" +
    msg +
    "\nLinea: " + line +
    "\nCol: " + col
  );
};
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

console.log("🔥 Firebase inicializado");

getDocs(collection(db, "clientes"))
  .then(snap => {
    console.log("✅ Firestore OK");
    snap.forEach(d => console.log(d.id, d.data()));
  })
  .catch(err => {
    console.error("❌ Firestore error:", err);
  });

