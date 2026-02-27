import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");
/* ===============================
   OBTENER ID
================================ */
const params = new URLSearchParams(location.search);
const id = params.get("id");
const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.appspot.com",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const secciones = document.querySelectorAll(".seccion");
const botones = document.querySelectorAll(".menu-item");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function mostrarSeccion(id) {
  secciones.forEach(sec => {
    sec.style.display = sec.id === id ? "block" : "none";
  });
/* PARAMS */
const id = new URLSearchParams(location.search).get("id");
if (!id) {
  alert("Ensayo no encontrado");
  location.href = "ensayos.html";
  document.body.innerHTML = "Ensayo no encontrado";
  throw new Error("ID faltante");
}

botones.forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    const target = btn.getAttribute("href").replace("#", "");
    mostrarSeccion(target);
  });
});
/* ===============================
   REFERENCIAS DOM
================================ */
const clienteNombre = document.getElementById("clienteNombre");
const fechaEnsayo = document.getElementById("fechaEnsayo");
const tituloEnsayo = document.getElementById("tituloEnsayo");

// Carga de datos
async function cargarEnsayo() {
  if (!ensayoId) return;
/* ===============================
   FUNCIONES
================================ */
function mostrarBloque(id, titulo, contenido) {
  if (!contenido) return;

  const div = document.getElementById(id);
  div.classList.remove("oculto");
  div.innerHTML = `
    <h4>${titulo}</h4>
    <p>${contenido}</p>
  `;
const ref = doc(db, "ensayos", id);
const snap = await getDoc(ref);
if (!snap.exists()) {
  document.body.innerHTML = "Ensayo no encontrado";
  throw new Error("No existe");
}

function mostrarEvidencia(media) {
  if (!media || !media.length) return;
const e = snap.data();

  const cont = document.getElementById("evidencia");
  cont.classList.remove("oculto");
/* HEADER */
document.getElementById("cliente").textContent = e.clienteNombre || "";
document.getElementById("nombreEnsayo").textContent = e.nombreEnsayo || "";

  const btn = cont.querySelector(".btn-media");
document.getElementById("fecha").textContent =
  e.fecha?.toDate
    ? e.fecha.toDate().toLocaleDateString("es-AR")
    : "";

  btn.onclick = () => {
    if (cont.querySelector(".galeria")) return;
/* SECCIONES */
function cargar(id, titulo, texto) {
  if (!texto) return;
  const div = document.getElementById(id);
  div.innerHTML = `<h3>${titulo}</h3><p>${texto}</p>`;
  div.dataset.visible = "1";
}

    const galeria = document.createElement("div");
    galeria.className = "galeria";
cargar("propuesta", "Propuesta", e.propuesta);
cargar("dosis", "Dosis", e.dosis);
cargar("metodologia", "Metodología", e.metodologia);
cargar("resultados", "Resultados", e.resultados);
cargar("conclusion", "Conclusión", e.conclusion);

    media.forEach(url => {
      if (url.match(/\.(mp4|webm|ogg)$/)) {
        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        galeria.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = url;
        galeria.appendChild(img);
      }
    });
if (e.propuestaComercial) {
  cargar("comercial", "Propuesta comercial", e.propuestaComercial);
  document.getElementById("btnComercial").hidden = false;
}

    cont.appendChild(galeria);
/* IMÁGENES */
if (e.fotos && e.fotos.length) {
  document.getElementById("btnMedia").hidden = false;
  document.getElementById("btnMedia").onclick = () => {
    window.open(e.fotos[0], "_blank");
  };
}

  const ref = doc(db, "ensayos", ensayoId);
/* ===============================
   CARGAR ENSAYO
================================ */
async function cargarEnsayo() {
  const ref = doc(db, "ensayos", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;
  if (!snap.exists()) {
    alert("Ensayo no encontrado");
    location.href = "ensayos.html";
    return;
  }

  const d = snap.data();
  const e = snap.data();

  document.getElementById("empresa").textContent = d.cliente || "";
  document.getElementById("fecha").textContent = d.fecha || "";
  document.getElementById("nombreEnsayo").textContent = d.nombreEnsayo || "";
  clienteNombre.textContent = e.cliente || "";
  fechaEnsayo.textContent = e.fecha || "";
  tituloEnsayo.textContent = e.nombreEnsayo || "";

  document.getElementById("propuesta-texto").textContent = d.propuesta || "";
  document.getElementById("dosis-texto").textContent = d.dosis || "";
  document.getElementById("elaboracion-texto").textContent = d.elaboracion || "";
  document.getElementById("resultados-texto").textContent = d.resultados || "";
  document.getElementById("conclusion-texto").textContent = d.conclusion || "";
  document.getElementById("precio-texto").textContent = d.precio || "";
  mostrarBloque("propuesta", "Propuesta", e.propuesta);
  mostrarBloque("dosis", "Dosis", e.dosis);
  mostrarBloque("conclusion", "Conclusión", e.conclusion);
  mostrarBloque("comercial", "Propuesta comercial", e.propuestaComercial);
/* MENÚ */
const botones = document.querySelectorAll(".ensayo-menu button");
const secciones = document.querySelectorAll(".ensayo-seccion");

  // mostrar primera sección
  mostrarSeccion("propuesta");
  mostrarEvidencia(e.media || e.fotos);
function activar(id) {
  secciones.forEach(s => s.classList.remove("activa"));
  document.getElementById(id)?.classList.add("activa");
}

/* ===============================
   NAVEGACIÓN SIDEBAR
================================ */
document.querySelectorAll(".ensayo-menu button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.seccion;
    const bloque = document.getElementById(id);
    if (bloque && !bloque.classList.contains("oculto")) {
      bloque.scrollIntoView({ behavior: "smooth" });
    }
  });
botones.forEach(b => {
  b.onclick = () => activar(b.dataset.seccion);
});

cargarEnsayo();
/* DEFAULT */
const primera = [...secciones].find(s => s.dataset.visible);
if (primera) primera.classList.add("activa");
