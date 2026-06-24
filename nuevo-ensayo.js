import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ============================
// 🔹 FIREBASE CONFIG
// ============================
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.firebasestorage.app", // ✅ BUCKET CORRECTO
  messagingSenderId: "143868382036",
  appId: "TU_APP_ID"
};

// ============================
// 🔹 INIT
// ============================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ============================
// 🔹 ELEMENTOS DOM
// ============================
const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");
const inputFotos = document.getElementById("fotos");

// ============================
// 🔹 CARGAR CLIENTES
// ============================
async function cargarClientes() {
  try {
    const snap = await getDocs(collection(db, "clientes"));
    snap.forEach(doc => {
      const option = document.createElement("option");
      option.value =
