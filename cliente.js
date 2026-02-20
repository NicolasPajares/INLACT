/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
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
 * DOM
 **********************/
const nombreEl = document.getElementById("clienteNombre");
const datosEl = document.getElementById("clienteDatos");
const visitasEl = document.getElementById("listaVisitasCliente");

/**********************
 * INIT
 **********************/
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  if (!clienteId) {
    nombreEl.textContent = "Cliente no especificado";
    return;
  }

  await cargarCliente(clienteId);
  await cargarVisitas(clienteId);
});

/**********************
 * CLIENTE
 **********************/
async function cargarCliente(clienteId) {
  try {
    const ref = doc(db, "clientes", clienteId);
    const
