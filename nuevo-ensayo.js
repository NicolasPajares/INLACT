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
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clienteOption =
    selectCliente.options[selectCliente.selectedIndex];

  const nuevoEnsayo = {
    clienteId: selectCliente.value,
    clienteNombre: clienteOption.dataset.nombre,

    nombreEnsayo: nombreEnsayoEl.value,

    fecha: Timestamp.fromDate(new Date(fechaEl.value)),

    propuesta: propuestaEl.value || "",
    dosis: dosisEl.value || "",
    metodologia: elaboracionEl.value || "",
    resultados: resultadosEl.value || "",

    fotos: [],
    creadoEn: Timestamp.now()
  };

  try {
    const docRef = await addDoc(
      collection(db, "ensayos"),
      nuevoEnsayo
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
