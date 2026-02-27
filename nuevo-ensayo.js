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
const nombreEnsayoEl = document.getElementById("nombreEnsayo"); // NUEVO
const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const metodologiaEl = document.getElementById("metodologia");
const resultadosEl = document.getElementById("resultados");

/**********************
 * CARGAR CLIENTES
 **********************/
async function cargarClientes() {
  selectCliente.innerHTML = `<option value="">Cargando clientes...</option>`;

  try {
    const snap = await getDocs(collection(db, "clientes"));

    if (snap.empty) {
      selectCliente.innerHTML = `<option value="">No hay clientes cargados</option>`;
      return;
    }

    selectCliente.innerHTML = `<option value="">Seleccionar cliente</option>`;

    snap.forEach(docu => {
      const cliente = docu.data();

      const option = document.createElement("option");
      option.value = docu.id;
      option.textContent = cliente.nombre || "Cliente sin nombre";

      selectCliente.appendChild(option);
    });

  } catch (error) {
    console.error("Error cargando clientes:", error);
    selectCliente.innerHTML = `<option value="">Error al cargar clientes</option>`;
  }
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
    selectCliente.options[selectCliente.selectedIndex].text;

  const nuevoEnsayo = {
    clienteId: selectCliente.value,
    clienteNombre,
    nombreEnsayo: nombreEnsayoEl.value,

    fecha: Timestamp.fromDate(new Date(fechaEl.value)),

    propuesta: propuestaEl.value || "",
    dosis: dosisEl.value || "",
    metodologia: metodologiaEl.value || "",
    resultados: resultadosEl.value || "",

    creadoEn: Timestamp.now()
  };

  try {
    const docRef = await addDoc(collection(db, "ensayos"), nuevoEnsayo);

    // Redirigir al informe
    window.location.href = `ensayo.html?id=${docRef.id}`;

  } catch (error) {
    console.error("Error al guardar ensayo:", error);
    alert("Error al guardar el ensayo");
  }
});

/**********************
 * INIT
 **********************/
cargarClientes();
