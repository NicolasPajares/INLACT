/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
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
 * ELEMENTOS
 **********************/
const listaEl = document.getElementById("listaClientes");
const buscadorEl = document.getElementById("buscadorClientes");
const btnNuevo = document.getElementById("btnNuevoCliente");

let clientes = [];

/**********************
 * BOTÓN NUEVO CLIENTE
 **********************/
btnNuevo.addEventListener("click", () => {
  window.location.href = "nuevo-cliente.html";
});

/**********************
 * CARGAR CLIENTES
 **********************/
async function cargarClientes() {
  listaEl.innerHTML = "<li>Cargando clientes...</li>";

  const snap = await getDocs(collection(db, "clientes"));

  clientes = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  if (clientes.length === 0) {
    listaEl.innerHTML = "<li>No hay clientes cargados</li>";
    return;
  }

  renderClientes(clientes);
}

/**********************
 * RENDER
 **********************/
function renderClientes(lista) {
  listaEl.innerHTML = "";

  lista.forEach(c => {
    const li = document.createElement("li");
    li.className = "cliente-item";

    li.innerHTML = `
      <div>
        <strong>${c.nombre || "Sin nombre"}</strong><br>
        <small>${c.localidad || ""} ${c.provincia || ""}</small>
      </div>
    `;

    li.addEventListener("click", () => {
      window.location.href = `cliente.html?id=${c.id}`;
    });

    listaEl.appendChild(li);
  });
}

/**********************
 * BUSCADOR
 **********************/
buscadorEl.addEventListener("input", () => {
  const texto = buscadorEl.value.toLowerCase();

  const filtrados = clientes.filter(c =>
    (c.nombre || "").toLowerCase().includes(texto) ||
    (c.localidad || "").toLowerCase().includes(texto)
  );

  renderClientes(filtrados);
});

/**********************
 * INIT
 **********************/
cargarClientes();
