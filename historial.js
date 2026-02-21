/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where
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
const contenedor = document.getElementById("lista-visitas");
const buscador = document.getElementById("buscador");
const btnVolver = document.getElementById("cerrar-historial");

/**********************
 * clienteId opcional
 **********************/
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("clienteId");

/**********************
 * CARGAR VISITAS
 **********************/
async function cargarVisitas() {
  contenedor.innerHTML = "<p>Cargando visitas...</p>";

  let q;
  if (clienteId) {
    q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );
  } else {
    q = query(
      collection(db, "visitas"),
      orderBy("fecha", "desc")
    );
  }

  const snap = await getDocs(q);
  contenedor.innerHTML = "";

  if (snap.empty) {
    contenedor.innerHTML = "<p>No hay visitas registradas.</p>";
    return;
  }

  snap.forEach(doc => {
    const v = doc.data();

    const fecha = v.fecha?.toDate
      ? v.fecha.toDate().toLocaleString("es-AR")
      : "";

    let clase = "";
    if (v.tipoVisita === "Entrega de productos") clase = "entrega";
    if (v.tipoVisita === "Visita comercial") clase = "comercial";
    if (v.tipoVisita === "Ensayo") clase = "ensayo";

    let productosHTML = "";
    if (v.tipoVisita === "Entrega de productos" && Array.isArray(v.productos)) {
      productosHTML = `
        <div class="productos">
          ${v.productos.map(p =>
            `<div class="producto">📦 ${p.nombre} ${p.cantidad ? `(${p.cantidad})` : ""}</div>`
          ).join("")}
        </div>
      `;
    }

    const div = document.createElement("div");
    div.className = `visita ${clase}`;

    div.innerHTML = `
      <strong>${v.cliente || "Cliente sin nombre"}</strong>
      <div class="fecha">${fecha}</div>
      <span class="badge">${v.tipoVisita}</span>
      ${productosHTML}
    `;

    contenedor.appendChild(div);
  });
}

/**********************
 * BUSCADOR
 **********************/
buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase();
  document.querySelectorAll(".visita").forEach(v => {
    v.style.display = v.textContent.toLowerCase().includes(texto)
      ? "block"
      : "none";
  });
});

/**********************
 * VOLVER
 **********************/
btnVolver.addEventListener("click", () => {
  window.history.back();
});

cargarVisitas();
