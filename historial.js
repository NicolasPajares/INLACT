/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
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
const contenedor = document.getElementById("lista-visitas");
const buscador = document.getElementById("buscador");
const btnVolver = document.getElementById("cerrar-historial");

/**********************
 * CARGAR VISITAS
 **********************/
async function cargarVisitas() {
  contenedor.innerHTML = "Cargando visitas...";

  const q = query(
    collection(db, "visitas"),
    orderBy("fecha", "desc")
  );

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
      : "Sin fecha";

    const tipo = v.tipoVisita || "Sin tipo";

    let claseTipo = "";
    if (tipo === "Visita comercial") claseTipo = "comercial";
    if (tipo === "Ensayo") claseTipo = "ensayo";
    if (tipo === "Entrega de productos") claseTipo = "entrega";

    let productoHTML = "";
    if (tipo === "Entrega de productos" && v.producto) {
      productoHTML = `
        <div class="producto">
          📦 ${v.producto} ${v.cantidad ? `(${v.cantidad})` : ""}
        </div>
      `;
    }

    const div = document.createElement("div");
    div.className = "visita";

    div.innerHTML = `
      <strong>${v.cliente || "Cliente sin nombre"}</strong><br>
      <span class="fecha">${fecha}</span><br>
      <span class="badge ${claseTipo}">${tipo}</span>
      ${productoHTML}
    `;

    contenedor.appendChild(div);
  });
}

/**********************
 * BUSCADOR
 **********************/
buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase();
  const visitasDOM = document.querySelectorAll(".visita");

  visitasDOM.forEach(visita => {
    const contenido = visita.textContent.toLowerCase();
    visita.style.display = contenido.includes(texto) ? "block" : "none";
  });
});

/**********************
 * BOTÓN VOLVER
 **********************/
btnVolver.addEventListener("click", () => {
  window.location.href = "index.html";
});

/**********************
 * INICIAR
 **********************/
cargarVisitas();
