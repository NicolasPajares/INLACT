console.log("nuevo-ensayo.js cargado correctamente");
/**********************
 * FIREBASE
 **********************/
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

/**********************
 * CONFIG
 **********************/
const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.appspot.com",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

/**********************
 * INIT
 **********************/
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
const fotosInput = document.getElementById("fotos");

/**********************
 * CARGAR CLIENTES (RESTAURADO)
 **********************/
async function cargarClientes() {
  const snap = await getDocs(collection(db, "clientes"));

  snap.forEach(docu => {
    const cliente = docu.data();
    const option = document.createElement("option");
    option.value = docu.id;
    option.textContent = cliente.nombre || "Cliente sin nombre";
    option.dataset.nombre = cliente.nombre || "";
    selectCliente.appendChild(option);
  });
}

/**********************
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const clienteOption =
      selectCliente.options[selectCliente.selectedIndex];

    /***************
     * SUBIR FOTOS
     ***************/
    const archivos = fotosInput?.files || [];
    const urlsFotos = [];

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      const storageRef = ref(
        storage,
        `ensayos/${Date.now()}_${archivo.name}`
      );

      await uploadBytes(storageRef, archivo);
      const url = await getDownloadURL(storageRef);
      urlsFotos.push(url);
    }

    /***************
     * GUARDAR DOC
     ***************/
    const nuevoEnsayo = {
      clienteId: selectCliente.value,
      clienteNombre: clienteOption.dataset.nombre,

      nombreEnsayo: nombreEnsayoEl.value,
      fecha: Timestamp.fromDate(new Date(fechaEl.value)),

      propuesta: propuestaEl.value || "",
      dosis: dosisEl.value || "",
      elaboracion: elaboracionEl.value || "",
      resultados: resultadosEl.value || "",
      conclusion: conclusionEl.value || "",
      propuestaComercial: propuestaComercialEl.value || "",

      fotos: urlsFotos,
      creadoEn: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, "ensayos"), nuevoEnsayo);

    // redirige al ensayo
    window.location.href = `ensayo.html?id=${docRef.id}`;

  } catch (error) {
    console.error("Error guardando ensayo:", error);
    alert("Error al guardar el ensayo");
  }
});

/**********************
 * INIT
 **********************/
window.addEventListener("DOMContentLoaded", () => {
  cargarClientes();
});
