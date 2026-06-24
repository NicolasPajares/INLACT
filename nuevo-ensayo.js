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

/* ========================
   FIREBASE CONFIG
======================== */
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.appspot.com",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:xxxx"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/* ========================
   CARGAR CLIENTES (NO TOCAR)
======================== */
const clienteSelect = document.getElementById("cliente");

async function cargarClientes() {
  const snap = await getDocs(collection(db, "clientes"));
  snap.forEach(doc => {
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = doc.data().nombre;
    clienteSelect.appendChild(opt);
  });
}

cargarClientes();

/* ========================
   GUARDAR ENSAYO
======================== */
const form = document.getElementById("formEnsayo");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const cliente = clienteSelect.value;
    const conclusion = document.getElementById("conclusion").value;
    const propuesta = document.getElementById("propuesta").value;
    const archivo = document.getElementById("foto").files[0];

    let fotoURL = "";

    // 🔹 SI HAY FOTO → STORAGE
    if (archivo) {
      const storageRef = ref(
        storage,
        `ensayos/${Date.now()}_${archivo.name}`
      );

      await uploadBytes(storageRef, archivo);
      fotoURL = await getDownloadURL(storageRef);
    }

    // 🔹 FIRE
