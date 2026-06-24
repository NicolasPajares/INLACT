/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.firebasestorage.app", // ✅ bucket correcto
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

/**********************
 * URL
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");
const esPublico = params.get("publico") === "1";

/**********************
 * ESTADO
 **********************/
let imagenesPendientes = [];
let subiendo = false;

/**********************
 * AUTH + INIT
 **********************/
signInAnonymously(auth)
  .then(() => {
    console.log("Auth anónima OK");
    cargarEnsayo();
  })
  .catch(err => {
    console.warn("Auth falló, intento igual:", err);
    cargarEnsayo();
  });

/**********************
 * CARGAR ENSAYO
 **********************/
async function cargarEnsayo() {
  if (!ensayoId) return;

  const refEnsayo = doc(db, "ensayos", ensayoId);
  const snap = await getDoc(refEnsayo);
  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("empresa").textContent = data.clienteNombre || "";
  document.getElementById("nombre-ensayo").textContent = data.nombreEnsayo || "";
  document.getElementById("fecha").textContent =
    data.fecha?.toDate().toLocaleDateString() || "";

  const fotosDiv = document.getElementById("fotos");
  fotosDiv.innerHTML = `<h3 style="color:#1f4e8c; margin-bottom:16px;">Imágenes</h3>`;

  if (!esPublico) {
    fotosDiv.innerHTML += `
      <input type="file" id="inputFotos" accept="image/*" multiple style="margin-bottom:12px;" />
      <button id="btnGuardar">Guardar imágenes</button>
      <p id="estado" style="margin-top:8px;"></p>
      <div id="link" style="margin-top:16px;"></div>
    `;

    document
      .getElementById("inputFotos")
      .addEventListener("change", onSeleccionFotos);

    document
      .getElementById("btnGuardar")
      .addEventListener("click", guardarImagenes);
  }

  // Render imágenes existentes
  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => renderImagen(url));
  }

  // ✅ MOSTRAR LINK SIEMPRE (esto es lo nuevo)
  if (!esPublico) {
    mostrarLinkCliente();
  }
}

/**********************
 * SELECCIONAR FOTOS
 **********************/
function onSeleccionFotos(e) {
  const archivos = Array.from(e.target.files);
  if (!archivos.length) return;

  archivos.forEach(file => {
    imagenesPendientes.push(file);
    const previewUrl = URL.createObjectURL(file);
    renderImagen(previewUrl, true);
  });

  e.target.value = "";
}

/**********************
 * GUARDAR IMÁGENES
 **********************/
async function guardarImagenes() {
  if (subiendo || !imagenesPendientes.length) return;

  subiendo = true;

  const estado = document.getElementById("estado");
  const btn = document.getElementById("btnGuardar");

  btn.disabled = true;
  estado.textContent = "Guardando imágenes...";

  const refEnsayo = doc(db, "ensayos", ensayoId);

  try {
    for (const archivo of imagenesPendientes) {
      const storageRef = ref(
        storage,
        `ensayos/${ensayoId}/${Date.now()}_${archivo.name}`
      );

      await uploadBytes(storageRef, archivo);
      const urlFinal = await getDownloadURL(storageRef);

      await updateDoc(refEnsayo, {
        fotos: arrayUnion(urlFinal)
      });
    }

    imagenesPendientes = [];
    estado.textContent = "Imágenes guardadas correctamente ✅";

    mostrarLinkCliente();

  } catch (err) {
    console.error(err);
    estado.textContent = "❌ Error al guardar imágenes";
    alert("Error subiendo imágenes. Ver consola.");
  } finally {
    subiendo = false;
    btn.disabled = false;
  }
}

/**********************
 * RENDER IMAGEN
 **********************/
function renderImagen(url, preview = false) {
  const fotosDiv = document.getElementById("fotos");

  const img = document.createElement("img");
  img.src = url;
  img.style.width = "100%";
  img.style.maxWidth = "480px";
  img.style.display = "block";
  img.style.marginBottom = "16px";
  img.style.borderRadius = "12px";
  if (preview) img.style.opacity = "0.6";

  fotosDiv.appendChild(img);
}

/**********************
 * LINK CLIENTE (SIEMPRE VISIBLE)
 **********************/
function mostrarLinkCliente() {
  const linkDiv = document.getElementById("link");
  if (!linkDiv) return;

  const link =
    `${window.location.origin}/INLACT/ensayo.html?id=${ensayoId}&publico=1`;

  linkDiv.innerHTML = `
    <p><strong>Link para el cliente</strong></p>
    <input type="text" value="${link}" readonly style="width:100%; padding:8px;" />
  `;
}
