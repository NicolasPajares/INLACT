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
const elaboracionEl = document.getElementById("elaboracion");
const resultadosEl = document.getElementById("resultados");
const conclusionEl = document.getElementById("conclusion");
const propuestaComercialEl = document.getElementById("propuestaComercial");
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
      `ensayos/${ensayoId}/${Date.now()}_${file.name}`
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

  const files = fotosEl.files;

  if (files.length > 10) {
    alert("Podés subir hasta 10 fotos como máximo");
    return;
  }

  try {
    // 1️⃣ Crear ensayo sin fotos
    const docRef = await addDoc(
      collection(db, "ensayos"),
      {
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

        fotos: [],
        creadoEn: Timestamp.now()
      }
    );

    // 2️⃣ Subir fotos (si hay)
    let fotosUrls = [];
    if (files.length > 0) {
      fotosUrls = await subirFotos(files, docRef.id);
    }

    // 3️⃣ Actualizar ensayo con fotos
    await fetch(
      `https://firestore.googleapis.com/v1/projects/inlact/databases/(default)/documents/ensayos/${docRef.id}?updateMask.fieldPaths=fotos`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: {
            fotos: {
              arrayValue: {
                values: fotosUrls.map(url => ({
                  stringValue: url
                }))
              }
            }
          }
        })
      }
    );

    // 4️⃣ Redirigir
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
