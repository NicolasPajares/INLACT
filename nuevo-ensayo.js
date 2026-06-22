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
const elaboracionEl = document.getElementById("elaboracion");
const resultadosEl = document.getElementById("resultados");
const fotosEl = document.getElementById("fotos");

/**********************
 * CARGAR CLIENTES
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
 * SUBIR FOTOS
 **********************/
async function subirFotos(files, ensayoId) {
  const urls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const storageRef = ref(
      storage,
      `ensayos/${ensayoId}/foto_${Date.now()}_${file.name}`
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

  const clienteOption =
    selectCliente.options[selectCliente.selectedIndex];

  const archivos = fotosEl.files;

  if (archivos.length > 10) {
    alert("Máximo 10 fotos por ensayo");
    return;
  }

  try {
    /* 1️⃣ Crear ensayo SIN fotos */
    const docRef = await addDoc(collection(db, "ensayos"), {
      clienteId: selectCliente.value,
      clienteNombre: clienteOption.dataset.nombre,

      nombreEnsayo: nombreEnsayoEl.value,
      fecha: Timestamp.fromDate(new Date(fechaEl.value)),

      propuesta: propuestaEl.value || "",
      dosis: dosisEl.value || "",
      elaboracion: elaboracionEl.value || "",
      resultados: resultadosEl.value || "",
      conclusion: "",
      propuestaComercial: "",

      fotos: [],
      creadoEn: Timestamp.now()
    });

    /* 2️⃣ Subir fotos a Storage */
    let urls = [];
    if (archivos.length > 0) {
      urls = await subirFotos(archivos, docRef.id);
    }

    /* 3️⃣ Guardar URLs en Firestore */
    if (urls.length > 0) {
      await updateDoc(doc(db, "ensayos", docRef.id), {
        fotos: urls
      });
    }

    /* 4️⃣ Redirigir */
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
