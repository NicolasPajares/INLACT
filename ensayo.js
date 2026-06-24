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

/**********************
 * CONFIG
 **********************/
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
 * URL PARAMS
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");
const esPublico = params.get("publico") === "1";

/**********************
 * INIT
 **********************/
signInAnonymously(auth)
  .then(() => cargarEnsayo())
  .catch(() => cargarEnsayo());

/**********************
 * CARGAR ENSAYO
 **********************/
async function cargarEnsayo() {
  if (!ensayoId) return;

  const refEnsayo = doc(db, "ensayos", ensayoId);
  const snap = await getDoc(refEnsayo);
  if (!snap.exists()) return;

  const data = snap.data();

  // Encabezado
  document.getElementById("empresa").textContent = data.clienteNombre || "";
  document.getElementById("nombre-ensayo").textContent = data.nombreEnsayo || "";
  document.getElementById("fecha").textContent =
    data.fecha?.toDate().toLocaleDateString() || "";

  // Bloques de texto
  renderBloque("propuesta", "Propuesta", data.propuesta);
  renderBloque("dosis", "Dosis", data.dosis);
  renderBloque("elaboracion", "Elaboración", data.elaboracion);
  renderBloque("resultados", "Resultados", data.resultados);
  renderBloque("conclusion", "Conclusión", data.conclusion);
  renderBloque(
    "propuestacomercial",
    "Propuesta comercial",
    data.propuestaComercial
  );

  // Imágenes
  renderImagenes(data.fotos || []);

  // Link para clientes (solo si NO es público)
  if (!esPublico) {
    renderLinkCliente();
  }
}

/**********************
 * RENDER BLOQUE TEXTO
 **********************/
function renderBloque(id, titulo, contenido) {
  const contenedor = document.getElementById(id);
  if (!contenedor) return;

  contenedor.innerHTML = `
    <h3 style="color:#1f4e8c; margin-bottom:12px; font-weight:600;">
      ${titulo}
    </h3>
    <p style="white-space:pre-line;">
      ${contenido || "—"}
    </p>
  `;
}

/**********************
 * RENDER IMÁGENES
 **********************/
function renderImagenes(fotos) {
  const contenedor = document.getElementById("fotos");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <h3 style="color:#1f4e8c; margin-bottom:16px; font-weight:600;">
      Imágenes
    </h3>
  `;

  fotos.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "100%";
    img.style.maxWidth = "480px";
    img.style.display = "block";
    img.style.marginBottom = "16px";
    img.style.borderRadius = "12px";

    contenedor.appendChild(img);
  });
}

/**********************
 * LINK PARA CLIENTES
 **********************/
function renderLinkCliente() {
  const contenedor = document.getElementById("fotos");
  if (!contenedor) return;

  const linkPublico =
    `${window.location.origin}${window.location.pathname}?id=${ensayoId}&publico=1`;

  const bloque = document.createElement("div");
  bloque.style.marginTop = "24px";

  bloque.innerHTML = `
    <h4 style="color:#1f4e8c; margin-bottom:8px;">
      Link para los clientes
    </h4>
    <input
      type="text"
      value="${linkPublico}"
      readonly
      style="width:100%; padding:8px; font-size:14px;"
    />
  `;

  contenedor.appendChild(bloque);
}
