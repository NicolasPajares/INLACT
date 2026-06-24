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

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.firebasestorage.app",
  messagingSenderId: "143868382036",
  appId: "TU_APP_ID"
};

// 🔹 Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app, "gs://inlact.firebasestorage.app");

// ============================
// CARGAR CLIENTES (NO TOCAR)
// ============================
const selectCliente = document.getElementById("cliente");

async function cargarClientes() {
  try {
    const snap = await getDocs(collection(db, "clientes"));
    snap.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = doc.data().nombre;
      selectCliente.appendChild(option);
    });
  } catch (e) {
    console.error("Error cargando clientes", e);
  }
}

cargarClientes();

// ============================
// GUARDAR ENSAYO
// ============================
const form = document.getElementById("formNuevoEnsayo");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const cliente = selectCliente.value;
    const fecha = document.getElementById("fecha").value;
    const nombreEnsayo = document.getElementById("nombreEnsayo").value;
    const propuesta = document.getElementById("propuesta").value;
    const dosis = document.getElementById("dosis").value;
    const elaboracion = document.getElementById("elaboracion").value;
    const resultados = document.getElementById("resultados").value;
    const conclusion = document.getElementById("conclusion").value;
    const propuestaComercial = document.getElementById("propuestaComercial").value;

    const archivos = document.getElementById("fotos").files;
    const fotosURL = [];

    // 🔹 Subir fotos (si hay)
    for (const archivo of archivos) {
      const storageRef = ref(
        storage,
        `ensayos/${Date.now()}_${archivo.name}`
      );
      await uploadBytes(storageRef, archivo);
      const url = await getDownloadURL(storageRef);
      fotosURL.push(url);
    }

    // 🔹 Guardar ensayo en Firestore
    await addDoc(collection(db, "ensayos"), {
      cliente,
      fecha,
      nombreEnsayo,
      propuesta,
      dosis,
      elaboracion,
      resultados,
      conclusion,
      propuestaComercial,
      fotosURL,
      createdAt: Timestamp.now()
    });

    alert("Ensayo guardado correctamente");
    form.reset();

    // 🔹 Redirección
    window.location.href = "ensayos.html";

  } catch (error) {
    console.error("Error al guardar ensayo", error);
    alert("Error al guardar el ensayo");
  }
});
