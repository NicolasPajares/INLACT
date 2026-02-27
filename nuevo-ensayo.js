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
 * ELEMENTOS DOM
 **********************/
const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");

const fechaEl = document.getElementById("fecha");
const nombreEnsayoEl = document.getElementById("nombreEnsayo");
const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const metodologiaEl = document.getElementById("metodologia");
const resultadosEl = document.getElementById("resultados");
const fotosEl = document.getElementById("fotos");

/**********************
 * CARGAR CLIENTES
 **********************/
async function cargarClientes() {
  selectCliente.innerHTML = `<option value="">Cargando clientes...</option>`;

  const snap = await getDocs(collection(db, "clientes"));

  selectCliente.innerHTML = `<option value="">Seleccionar cliente</option>`;

  snap.forEach(docu => {
    const c = docu.data();
    const option = document.createElement("option");
    option.value = docu.id;
    option.textContent = c.nombre || "Cliente sin nombre";
    selectCliente.appendChild(option);
  });
}

/**********************
 * SUBIR FOTOS
 **********************/
async function subirFotos(ensayoId) {
  const archivos = fotosEl.files;
  const urls = [];

  for (const file of archivos) {
    const storageRef = ref(
      storage,
      `ensayos/${ensayoId}/${file.name}`
    );

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }

  return urls;
}

/**********************
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectCliente.value || !fechaEl.value || !nombreEnsayoEl.value) {
    alert("Completá cliente, fecha y nombre del ensayo");
    return;
  }

  const clienteNombre =
    selectCliente.selectedOptions[0].textContent;

  const nuevoEnsayo = {
    clienteId: selectCliente.value,
    clienteNombre,
    nombreEnsayo: nombreEnsayoEl.value,

    fecha: Timestamp.fromDate(new Date(fechaEl.value)),

    propuesta: propuestaEl.value || "",
    dosis: dosisEl.value || "",
    metodologia: metodologiaEl.value || "",
    resultados: resultadosEl.value || "",

    fotos: [],
    creadoEn: Timestamp.now()
  };

  try {
    const docRef = await addDoc(
      collection(db, "ensayos"),
      nuevoEnsayo
    );

    const fotosUrls = await subirFotos(docRef.id);

    await addDoc; // noop para claridad

    await fetch; // noop

    // actualizar fotos
    await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    ).then(({ updateDoc, doc }) =>
      updateDoc(doc(db, "ensayos", docRef.id), {
        fotos: fotosUrls
      })
    );

    window.location.href = `ensayo.html?id=${docRef.id}`;

  } catch (error) {
    console.error(error);
    alert("Error al guardar el ensayo");
  }
});

/**********************
 * INIT
 **********************/
cargarClientes();
