import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   OBTENER ID
================================ */
const params = new URLSearchParams(location.search);
const id = params.get("id");

if (!id) {
  alert("Ensayo no encontrado");
  location.href = "ensayos.html";
}

/* ===============================
   REFERENCIAS DOM
================================ */
const clienteNombre = document.getElementById("clienteNombre");
const fechaEnsayo = document.getElementById("fechaEnsayo");
const tituloEnsayo = document.getElementById("tituloEnsayo");

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
}

function mostrarEvidencia(media) {
  if (!media || !media.length) return;

  const cont = document.getElementById("evidencia");
  cont.classList.remove("oculto");

  const btn = cont.querySelector(".btn-media");

  btn.onclick = () => {
    if (cont.querySelector(".galeria")) return;

    const galeria = document.createElement("div");
    galeria.className = "galeria";

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

    cont.appendChild(galeria);
  };
}

/* ===============================
   CARGAR ENSAYO
================================ */
async function cargarEnsayo() {
  const ref = doc(db, "ensayos", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Ensayo no encontrado");
    location.href = "ensayos.html";
    return;
  }

  const e = snap.data();

  clienteNombre.textContent = e.cliente || "";
  fechaEnsayo.textContent = e.fecha || "";
  tituloEnsayo.textContent = e.nombreEnsayo || "";

  mostrarBloque("propuesta", "Propuesta", e.propuesta);
  mostrarBloque("dosis", "Dosis", e.dosis);
  mostrarBloque("conclusion", "Conclusión", e.conclusion);
  mostrarBloque("comercial", "Propuesta comercial", e.propuestaComercial);

  mostrarEvidencia(e.media || e.fotos);
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
});

cargarEnsayo();
