import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* FIREBASE */
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

/* PARAMS */
const params = new URLSearchParams(location.search);
const id = params.get("id");

if (!id) {
  document.body.innerHTML = "Ensayo no encontrado";
  throw new Error("ID faltante");
}

const snap = await getDoc(doc(db, "ensayos", id));
if (!snap.exists()) {
  document.body.innerHTML = "Ensayo inexistente";
  throw new Error("No existe");
}

const e = snap.data();

/* ENCABEZADO */
document.getElementById("empresa").textContent = e.clienteNombre || "";
document.getElementById("nombre-ensayo").textContent = e.nombreEnsayo || "";
document.getElementById("fecha").textContent =
  e.fecha?.toDate
    ? e.fecha.toDate().toLocaleDateString("es-AR")
    : "";

/* SECCIONES */
const secciones = {
  propuesta: e.propuesta,
  dosis: e.dosis,
  elaboracion: e.elaboracion,
  resultados: e.resultados,
  conclusion: e.conclusion,
  comercial: e.propuestaComercial,
  fotos: e.fotos && e.fotos.length
    ? `<div class="fotos">${e.fotos.map(f => `<img src="${f}">`).join("")}</div>`
    : "<p>No hay imágenes</p>"
};

/* CARGAR CONTENIDO EN CADA BLOQUE */
Object.entries(secciones).forEach(([id, contenido]) => {
  const bloque = document.getElementById(id);
  if (!bloque) return;

  bloque.innerHTML = `
    <h3>${id.charAt(0).toUpperCase() + id.slice(1)}</h3>
    ${contenido ? `<p>${contenido}</p>` : "<p>No hay información</p>"}
  `;
});

/* BOTONES → SCROLL AMPLIO */
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const destino = document.getElementById(btn.dataset.seccion);
    if (!destino) return;

    destino.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});
