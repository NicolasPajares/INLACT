/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const storage = getStorage(app);

/**********************
 * DOM
 **********************/
const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");

const fechaEl = document.getElementById("fecha");
const nombreEnsayoEl = document.getElementById("nombreEnsayo");
const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const elaboracionEl = document.getElementById("elaboracion");
const resultadosEl = document.getElementById("resultados");
const conclusionEl = document.getElementById("conclusion");
const propuestaComercialEl = document.getElementById("propuestaComercial");
const fotoEl = document.getElementById("fotoEnsayo");

/**********************
 * CARGAR CLIENTES (ROBUSTO)
 **********************/
async function cargarClientes() {
  selectCliente.innerHTML = `<option value="">Cargando clientes...</option>`;
  selectCliente.disabled = true;

  try {
    const snap = await getDocs(collection(db, "clientes"));

    selectCliente.innerHTML = `<option value="">Seleccionar cliente</option>`;

    snap.forEach(docu => {
      const cliente = docu.data();
      const option = document.createElement("option");
      option.value = docu.id;
      option.textContent = cliente.nombre || "Cliente sin nombre";
      option.dataset.nombre = cliente.nombre || "";
      selectCliente.appendChild(option);
    });

    selectCliente.disabled = false;

  } catch (err) {
    console.error("Error cargando clientes", err);
    selectCliente.innerHTML = `<option value="">Error al cargar clientes</option>`;
  }
}

/**********************
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectCliente.value) {
    alert("Tenés que seleccionar un cliente");
    return;
  }

  try {
    const clienteOption =
      selectCliente.options[selectCliente.selectedIndex];

    // 1️⃣ Crear ensayo base
    const nuevoEnsayo = {
      clienteId: selectCliente.value,
      clienteNombre: clienteOption.dataset.nombre || "",

      nombreEnsayo: nombreEnsayoEl.value || "",
      fecha: Timestamp.fromDate(new Date(fechaEl.value)),

      propuesta: propuestaEl.value || "",
      dosis: dosisEl.value || "",
      elaboracion: elaboracionEl.value || "",
      resultados: resultadosEl.value || "",
      conclusion: conclusionEl.value || "",
      propuestaComercial: propuestaComercialEl.value || "",

      fotos: [],
      creadoEn: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, "ensayos"), nuevoEnsayo);

    // 2️⃣ Subir imagen SOLO si existe
    if (fotoEl.files.length > 0) {
      const file = fotoEl.files[0];

      const storageRef = ref(
        storage,
        `ensayos/${docRef.id}/${Date.now()}_${file.name}`
      );

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "ensayos", docRef.id), {
        fotos: [downloadURL]
      });
    }

    // 3️⃣ Redirigir
    window.location.href = `ensayo.html?id=${docRef.id}`;

  } catch (error) {
    console.error("Error guardando ensayo:", error);
    alert("Error al guardar el ensayo");
  }
});

/**********************
 * INIT
 **********************/
document.addEventListener("DOMContentLoaded", cargarClientes);
