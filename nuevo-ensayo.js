/*************************
 * FIREBASE
 *************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
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

/*************************
 * ELEMENTOS
 *************************/
const selectCliente = document.getElementById("cliente");
const btnGuardar = document.getElementById("btnGuardar");

/*************************
 * CARGAR CLIENTES
 *************************/
async function cargarClientes() {
  selectCliente.innerHTML = "<option value=''>Seleccionar cliente</option>";

  const snap = await getDocs(collection(db, "clientes"));

  snap.forEach(doc => {
    const c = doc.data();
    const opt = document.createElement("option");
    opt.value = c.nombre;
    opt.textContent = c.nombre;
    selectCliente.appendChild(opt);
  });
}

cargarClientes();

/*************************
 * GUARDAR ENSAYO
 *************************/
btnGuardar.addEventListener("click", async () => {
  const cliente = selectCliente.value;
  const nombre = document.getElementById("nombre").value.trim();
  const fechaInput = document.getElementById("fecha").value;
  const objetivo = document.getElementById("objetivo").value.trim();
  const desarrollo = document.getElementById("desarrollo").value.trim();
  const conclusion = document.getElementById("conclusion").value.trim();

  if (!cliente || !nombre) {
    alert("Cliente y nombre del ensayo son obligatorios");
    return;
  }

  try {
    await addDoc(collection(db, "ensayos"), {
      cliente,
      nombre,
      objetivo,
      desarrollo,
      conclusion,
      fecha: fechaInput ? new Date(fechaInput) : serverTimestamp(),
      creada: serverTimestamp()
    });

    alert("Ensayo guardado correctamente");
    window.location.href = "ensayos.html";

  } catch (error) {
    console.error(error);
    alert("Error al guardar el ensayo");
  }
});
