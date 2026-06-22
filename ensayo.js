/**********************
 * FIREBASE
 **********************/
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

/**********************
 * ELEMENTOS DOM
 **********************/
const empresaEl = document.getElementById("empresa");
const fechaEl = document.getElementById("fecha");
const nombreEnsayoEl = document.getElementById("nombre-ensayo");

const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const elaboracionEl = document.getElementById("elaboracion");
const resultadosEl = document.getElementById("resultados");
const conclusionEl = document.getElementById("conclusion");
const propuestaComercialEl = document.getElementById("propuestacomercial");
const fotosEl = document.getElementById("fotos");

/**********************
 * UTILS
 **********************/
function formatearFecha(ts) {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleDateString("es-AR");
}

function renderBloque(el, titulo, contenido) {
  if (!contenido || contenido.trim() === "") return;

  el.innerHTML = `
    <h3>${titulo}</h3>
    <p>${contenido.replace(/\n/g, "<br>")}</p>
  `;
}

/**********************
 * CARGAR ENSAYO
 **********************/
async function cargarEnsayo() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("Ensayo no encontrado");
    return;
  }

  const refEnsayo = doc(db, "ensayos", id);
  const snap = await getDoc(refEnsayo);

  if (!snap.exists()) {
    alert("Ensayo no existe");
    return;
  }

  const e = snap.data();

  /* ENCABEZADO */
  empresaEl.textContent = e.clienteNombre || "";
  fechaEl.textContent = formatearFecha(e.fecha);
  nombreEnsayoEl.textContent = e.nombreEnsayo || "";

  /* BLOQUES */
  renderBloque(propuestaEl, "Propuesta", e.propuesta);
  renderBloque(dosisEl, "Dosis", e.dosis);
  renderBloque(elaboracionEl, "Elaboración", e.elaboracion);
  renderBloque(resultadosEl, "Resultados", e.resultados);
  renderBloque(conclusionEl, "Conclusión", e.conclusion);
  renderBloque(propuestaComercialEl, "Propuesta comercial", e.propuestaComercial);

  /* FOTOS */
  if (Array.isArray(e.fotos) && e.fotos.length > 0) {
    fotosEl.innerHTML = `<h3>Imágenes</h3>`;

    const contenedor = document.createElement("div");
    contenedor.className = "fotos";

    e.fotos.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.loading = "lazy";
      img.alt = "Foto del ensayo";

      img.addEventListener("click", () => {
        window.open(url, "_blank");
      });

      contenedor.appendChild(img);
    });

    fotosEl.appendChild(contenedor);
  }
}

/**********************
 * SCROLL MENU
 **********************/
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.seccion;
    const seccion = document.getElementById(id);
    if (seccion) {
      seccion.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/**********************
 * INIT
 **********************/
cargarEnsayo();
