import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
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

/* PARAMS */
const id = new URLSearchParams(location.search).get("id");
if (!id) {
  document.body.innerHTML = "Ensayo no encontrado";
  throw new Error("ID faltante");
}

const ref = doc(db, "ensayos", id);
const snap = await getDoc(ref);
if (!snap.exists()) {
  document.body.innerHTML = "Ensayo no encontrado";
  throw new Error("No existe");
}

const e = snap.data();

/* HEADER */
document.getElementById("cliente").textContent = e.clienteNombre || "";
document.getElementById("nombreEnsayo").textContent = e.nombreEnsayo || "";

document.getElementById("fecha").textContent =
  e.fecha?.toDate
    ? e.fecha.toDate().toLocaleDateString("es-AR")
    : "";

/* SECCIONES */
function cargar(id, titulo, texto) {
  if (!texto) return;
  const div = document.getElementById(id);
  div.innerHTML = `<h3>${titulo}</h3><p>${texto}</p>`;
  div.dataset.visible = "1";
}

cargar("propuesta", "Propuesta", e.propuesta);
cargar("dosis", "Dosis", e.dosis);
cargar("metodologia", "Metodología", e.metodologia);
cargar("resultados", "Resultados", e.resultados);
cargar("conclusion", "Conclusión", e.conclusion);

if (e.propuestaComercial) {
  cargar("comercial", "Propuesta comercial", e.propuestaComercial);
  document.getElementById("btnComercial").hidden = false;
}

/* IMÁGENES */
if (e.fotos && e.fotos.length) {
  document.getElementById("btnMedia").hidden = false;
  document.getElementById("btnMedia").onclick = () => {
    window.open(e.fotos[0], "_blank");
  };
}

/* MENÚ */
const botones = document.querySelectorAll(".ensayo-menu button");
const secciones = document.querySelectorAll(".ensayo-seccion");

function activar(id) {
  secciones.forEach(s => s.classList.remove("activa"));
  document.getElementById(id)?.classList.add("activa");
}

botones.forEach(b => {
  b.onclick = () => activar(b.dataset.seccion);
});

/* DEFAULT */
const primera = [...secciones].find(s => s.dataset.visible);
if (primera) primera.classList.add("activa");
