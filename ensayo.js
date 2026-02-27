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

/* CONTENIDO */
const contenido = document.getElementById("contenido");

const secciones = [
  { id: "propuesta", titulo: "Propuesta", contenido: e.propuesta },
  { id: "dosis", titulo: "Dosis", contenido: e.dosis },
  { id: "elaboracion", titulo: "Elaboración", contenido: e.elaboracion },
  { id: "resultados", titulo: "Resultados", contenido: e.resultados },
  { id: "conclusion", titulo: "Conclusión", contenido: e.conclusion },
  { id: "comercial", titulo: "Propuesta comercial", contenido: e.propuestaComercial },
  {
    id: "fotos",
    titulo: "Imágenes",
    contenido:
      e.fotos && e.fotos.length
        ? `<div class="fotos">${e.fotos.map(f => `<img src="${f}">`).join("")}</div>`
        : "No hay imágenes"
  }
];

/* render todas las secciones con scroll amplio */
contenido.innerHTML = secciones.map(sec => `
  <section id="${sec.id}" class="bloque" style="min-height: 100vh; padding-top: 40px;">
    <h3>${sec.titulo}</h3>
    <div>
      ${sec.contenido || "<p>No hay información</p>"}
    </div>
  </section>
`).join("");

/* botones → scroll suave */
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const destino = document.getElementById(btn.dataset.seccion);
    if (destino) {
      destino.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});
