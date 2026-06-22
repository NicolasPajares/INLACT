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
 * SUBIR FOTOS (SEGURO)
 **********************/
async function subirFotos(files) {
  const urls = [];

  if (!files || files.length === 0) return urls;

  for (const file of files) {
    try {
      const nombreSeguro =
        Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");

      const fotoRef = ref(storage, `ensayos/${nombreSeguro}`);

      await uploadBytes(fotoRef, file);
      const url = await getDownloadURL(fotoRef);

      urls.push(url);
    } catch (error) {
      console.error("Error subiendo foto:", error);
      // seguimos sin romper el guardado
    }
  }

  return urls;
}

/**********************
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const clienteOption =
      selectCliente.options[selectCliente.selectedIndex];

    const fotosURLs = await subirFotos(fotosInput.files);

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
      fotos: fotosURLs,
      creadoEn: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, "ensayos"), nuevoEnsayo);

    window.location.href = `ensayo.html?id=${docRef.id}`;

  } catch (error) {
    console.error("Error guardando ensayo:", error);
    alert("Error al guardar el ensayo");
  }
});

/**********************
 * INIT
 **********************/
cargarClientes();
