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

/* =========================
   FIREBASE CONFIG
========================= */
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
const storage = getStorage(app);

/* =========================
   CARGAR CLIENTES (NO TOCAR)
========================= */
const selectCliente = document.getElementById("cliente");

async function cargarClientes() {
  try {
    const snap = await getDocs(collection(db, "clientes"));
    snap.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = doc.data().nombre;
      selectCliente.appendChild(opt);
    });
  } catch (err) {
    console.error("Error cargando clientes", err);
  }
}
cargarClientes();

/* =========================
   GUARDAR ENSAYO
========================= */
const form = document.getElementById("formNuevoEnsayo");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // 🚨 CLAVE ABSOLUTA

  try {
    const data = {
      cliente: selectCliente.value,
      fecha: document.getElementById("fecha").value,
      nombreEnsayo: document.getElementById("nombreEnsayo").value,
      propuesta: document.getElementById("propuesta").value,
      dosis: document.getElementById("dosis").value,
      elaboracion: document.getElementById("elaboracion").value,
      resultados: document.getElementById("resultados").value,
      conclusion: document.getElementById("conclusion").value,
      propuestaComercial: document.getElementById("propuestaComercial").value,
      fechaCreacion: Timestamp.now(),
      fotos: []
    };

    const files = document.getElementById("fotos").files;

    if (files.length > 0) {
      for (const file of files) {
        const storageRef = ref(
          storage,
          `ensayos/${Date.now()}_${file.name}`
        );
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        data.fotos.push(url);
      }
    }

    await addDoc(collection(db, "ensayos"), data);

    alert("Ensayo guardado correctamente");
    form.reset();

    // opcional
    // location.href = "ensayos.html";

  } catch (error) {
    console.error("Error al guardar ensayo", error);
    alert("Error al guardar el ensayo");
  }
});
