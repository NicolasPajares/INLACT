/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
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
const listaEl = document.getElementById("listaClientes");
const buscadorEl = document.getElementById("buscadorClientes");
const btnNuevo = document.getElementById("btnNuevoCliente");

let clientes = [];

/**********************
 * NUEVO CLIENTE
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
  clientes = [];

  snap.forEach(d => {
    clientes.push({
      id: d.id,
      ...d.data()
    });
  });

  if (clientes.length === 0) {
    listaEl.innerHTML = "<li>No hay clientes cargados</li>";
    return;
  }

  renderClientes(clientes);
}

/**********************
 * RENDER CLIENTES
 **********************/
function renderClientes(lista) {
  listaEl.innerHTML = "";

  lista.forEach(c => {
    const li = document.createElement("li");
    li.className = "cliente-item";

    /* INFO */
    const info = document.createElement("div");
    info.className = "cliente-info";
    info.innerHTML = `
      <strong>${c.nombre || "Sin nombre"}</strong><br>
      <small>${c.localidad || ""} ${c.provincia || ""}</small>
    `;

    info.onclick = () => {
      window.location.href = `cliente.html?id=${c.id}`;
    };

    /* BOTÓN BORRAR */
    const btnBorrar = document.createElement("button");
    btnBorrar.className = "btn-borrar";
    btnBorrar.textContent = "✖";

    btnBorrar.onclick = async (e) => {
      e.stopPropagation(); // evita abrir el cliente

      const ok = confirm(`¿Querés borrar el cliente "${c.nombre}"?`);
      if (!ok) return;

      await deleteDoc(doc(db, "clientes", c.id));
      cargarClientes();
    };

    li.appendChild(info);
    li.appendChild(btnBorrar);
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
