/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.firebasestorage.app",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**********************
 * URL
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");

/**********************
 * AUTH + INIT
 **********************/
signInAnonymously(auth).then(cargarEnsayo);

/**********************
 * CARGAR ENSAYO
 **********************/
async function cargarEnsayo() {
  if (!ensayoId) return;

  const snap = await getDoc(doc(db, "ensayos", ensayoId));
  if (!snap.exists()) return;

  const data = snap.data();

  // Encabezado
  document.getElementById("empresa").textContent = data.clienteNombre || "";
  document.getElementById("nombre-ensayo").textContent = data.nombreEnsayo || "";
  document.getElementById("fecha").textContent =
    data.fecha?.toDate().toLocaleDateString() || "";

  // Secciones con títulos
  renderSeccion("propuesta", "Propuesta", data.propuesta);
  renderSeccion("dosis", "Dosis", data.dosis);
  renderSeccion("elaboracion", "Elaboración", data.elaboracion);
  renderSeccion("resultados", "Resultados", data.resultados);
  renderSeccion("conclusion", "Conclusión", data.conclusion);
  renderSeccion(
    "propuestacomercial",
    "Propuesta comercial",
    data.propuestaComercial
  );

  // Imágenes (como están ahora)
  if (Array.isArray(data.fotos)) {
    const fotosDiv = document.getElementById("fotos");
    fotosDiv.innerHTML = `<h3 class="titulo-seccion">Imágenes</h3>`;

    data.fotos.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.style.width = "100%";
      img.style.maxWidth = "480px";
      img.style.marginBottom = "16px";
      img.style.borderRadius = "12px";
      fotosDiv.appendChild(img);
    });
  }
}

/**********************
 * RENDER SECCION
 **********************/
function renderSeccion(id, titulo, contenido) {
  const div = document.getElementById(id);
  if (!div || !contenido) return;

  div.innerHTML = `
    <h3 style="color:#1f4e8c; margin-bottom:12px;">${titulo}</h3>
    <p style="white-space:pre-line;">${contenido}</p>
  `;
}
