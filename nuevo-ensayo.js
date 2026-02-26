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

const form = document.getElementById("formNuevoEnsayo");
const clienteSelect = document.getElementById("cliente");

/* ===============================
   CARGAR CLIENTES
================================ */
async function cargarClientes() {
  const snap = await getDocs(collection(db, "clientes"));
  clienteSelect.innerHTML = `<option value="">Seleccionar cliente</option>`;

  snap.forEach(doc => {
    const c = doc.data();
    const option = document.createElement("option");
    option.value = c.nombre;
    option.textContent = c.nombre;
    clienteSelect.appendChild(option);
  });
}

cargarClientes();

/* ===============================
   GUARDAR ENSAYO
================================ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ensayo = {
    cliente: clienteSelect.value,
    nombre: nombre.value,
    producto: producto.value,
    objetivo: objetivo.value,
    proceso: proceso.value,
    resultados: resultados.value,
    conclusion: conclusion.value,
    fecha: Timestamp.fromDate(new Date(fecha.value)),
    creado: Timestamp.now()
  };

  await addDoc(collection(db, "ensayos"), ensayo);
  window.location.href = "ensayos.html";
});
