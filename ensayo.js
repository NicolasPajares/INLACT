/**********************
 * FIREBASE
 **********************/
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

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
 * OBTENER ID
 **********************/
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  document.body.innerHTML = "<p>Ensayo no encontrado</p>";
  throw new Error("Falta ID de ensayo");
}

/**********************
 * CARGAR ENSAYO
 **********************/
const ref = doc(db, "ensayos", id);
const snap = await getDoc(ref);

if (!snap.exists()) {
  document.body.innerHTML = "<p>Ensayo no encontrado</p>";
  throw new Error("Ensayo inexistente");
}

const e = snap.data();

/**********************
 * FORMATEAR FECHA
 **********************/
const fecha = e.fecha?.toDate
  ? e.fecha.toDate().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  : "--/--/----";

/**********************
 * TITULOS
 **********************/
document.getElementById("tituloEnsayo").textContent =
  e.nombreEnsayo || "Ensayo técnico";

document.getElementById("subtituloEnsayo").textContent =
  e.clienteNombre || "";

/**********************
 * CONTENIDO
 **********************/
const div = document.getElementById("contenido");

div.innerHTML = `
  <div class="bloque">
    <h3>Fecha</h3>
    <p>${fecha}</p>
  </div>

  <div class="bloque">
    <h3>Propuesta</h3>
    <p>${e.propuesta || "-"}</p>
  </div>

  <div class="bloque">
    <h3>Dosis</h3>
    <p>${e.dosis || "-"}</p>
  </div>

  <div class="bloque">
    <h3>Metodología</h3>
    <p>${e.metodologia || "-"}</p>
  </div>

  <div class="bloque">
    <h3>Resultados</h3>
    <p>${e.resultados || "-"}</p>
  </div>

  <div class="bloque">
    <h3>Conclusión</h3>
    <p>${e.conclusion || "-"}</p>
  </div>

  ${
    e.fotos && e.fotos.length
      ? `
      <div class="bloque">
        <h3>Registro fotográfico</h3>
        <div class="fotos">
          ${e.fotos.map(url => `<img src="${url}" alt="Foto del ensayo">`).join("")}
        </div>
      </div>
      `
      : ""
  }
`;
