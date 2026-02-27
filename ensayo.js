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
  alert("Ensayo no encontrado");
  throw new Error("Falta ID de ensayo");
}

/**********************
 * CARGAR ENSAYO
 **********************/
const ref = doc(db, "ensayos", id);
const snap = await getDoc(ref);

if (!snap.exists()) {
  alert("Ensayo inexistente");
  throw new Error("Ensayo no existe");
}

const e = snap.data();

/**********************
 * FECHA FORMATEADA
 **********************/
const fecha = e.fecha?.toDate
  ? e.fecha.toDate().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  : "";

/**********************
 * HEADER (EMPRESA / ENSAYO / FECHA)
 **********************/
document.getElementById("nombreEnsayo").textContent =
  e.nombreEnsayo || "";

document.getElementById("clienteEnsayo").textContent =
  e.clienteNombre || "";

document.getElementById("fechaEnsayo").textContent =
  fecha;

/**********************
 * CONTENIDO
 **********************/
setTexto("propuesta", e.propuesta);
setTexto("dosis", e.dosis);
setTexto("elaboracion", e.elaboracion);
setTexto("resultados", e.resultados);
setTexto("conclusion", e.conclusion);

/**********************
 * FOTOS
 **********************/
const galeria = document.querySelector("#fotos .galeria");

if (e.fotos && e.fotos.length) {
  galeria.innerHTML = e.fotos
    .map(url => `<img src="${url}">`)
    .join("");
} else {
  document.getElementById("fotos").style.display = "none";
}

/**********************
 * HELPERS
 **********************/
function setTexto(id, valor) {
  const bloque = document.getElementById(id);
  const p = bloque.querySelector("p");

  if (valor && valor.trim() !== "") {
    p.textContent = valor;
  } else {
    bloque.style.display = "none";
  }
}
