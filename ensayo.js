import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");

const secciones = document.querySelectorAll(".seccion");
const botones = document.querySelectorAll(".menu-item");

function mostrarSeccion(id) {
  secciones.forEach(sec => {
    sec.style.display = sec.id === id ? "block" : "none";
  });
}

botones.forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    const target = btn.getAttribute("href").replace("#", "");
    mostrarSeccion(target);
  });
});

// Carga de datos
async function cargarEnsayo() {
  if (!ensayoId) return;

  const ref = doc(db, "ensayos", ensayoId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const d = snap.data();

  document.getElementById("empresa").textContent = d.cliente || "";
  document.getElementById("fecha").textContent = d.fecha || "";
  document.getElementById("nombreEnsayo").textContent = d.nombreEnsayo || "";

  document.getElementById("propuesta-texto").textContent = d.propuesta || "";
  document.getElementById("dosis-texto").textContent = d.dosis || "";
  document.getElementById("elaboracion-texto").textContent = d.elaboracion || "";
  document.getElementById("resultados-texto").textContent = d.resultados || "";
  document.getElementById("conclusion-texto").textContent = d.conclusion || "";
  document.getElementById("precio-texto").textContent = d.precio || "";

  // mostrar primera sección
  mostrarSeccion("propuesta");
}

cargarEnsayo();
