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

/* =====================
   FIREBASE CONFIG
===================== */
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.appspot.com",
  messagingSenderId: "143868382036",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app, "gs://inlact.appspot.com");

/* =====================
   CARGAR CLIENTES
   (NO SE TOCA)
===================== */
const selectCliente = document.getElementById("cliente");

async function cargarClientes() {
  const snap = await getDocs(collection(db, "clientes"));
  snap.forEach(doc => {
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = doc.data().nombre;
    selectCliente.appendChild(opt);
  });
}

cargarClientes();

/* =====================
   GUARDAR ENSAYO
===================== */
const form = document.getElementById("formNuevoEnsayo");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const cliente = selectCliente.value;
    const propuesta = document.getElementById("propuesta").value;
    const conclusion = document.getElementById("conclusion").value;
    const archivos = document.getElementById("fotos").files;

    const fotosURL = [];

    // 🔹 SUBE FOTOS (si hay)
    if (archivos.length > 0) {
      for (const archivo of archivos) {
        const storageRef = ref(
          storage,
          `ensayos/${Date.now()}_${archivo.name}`
        );
        await uploadBytes(storageRef, archivo);
        const url = await getDownloadURL(storageRef);
        fotosURL.push(url);
      }
    }

    // 🔹 GUARDA ENSAYO
    await addDoc(collection(db, "ensayos"), {
      cliente,
      propuesta,
      conclusion,
      fotos: fotosURL,
      fecha: Timestamp.now()
    });

    alert("✅ Ensayo guardado correctamente");
    window.location.href = "ensayos.html";

  } catch (err) {
    console.error("❌ Error al guardar", err);
    alert("Error al guardar el ensayo");
  }
});
