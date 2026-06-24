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

/**********************
 * CONFIG (BUCKET REAL)
 **********************/
const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.firebasestorage.app", // ✅ BUCKET CORRECTO
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
  .catch(() => {
    cargarEnsayo(); // por si las rules están abiertas
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

  const secciones = [
    "propuesta",
    "dosis",
    "elaboracion",
    "resultados",
    "conclusion",
    "propuestacomercial"
  ];

  const titulos = {
    propuesta: "Propuesta",
    dosis: "Dosis",
    elaboracion: "Elaboración",
    resultados: "Resultados",
    conclusion: "Conclusión",
    propuestacomercial: "Propuesta comercial"
  };

  secciones.forEach(id => {
    const campo = id === "propuestacomercial"
      ? "propuestaComercial"
      : id;

    document.getElementById(id).innerHTML = `
      <h3 style="color:#1f4e8c; margin-bottom:16px;">${titulos[id]}</h3>
      <p>${data[campo] || ""}</p>
    `;
  });

  const fotosDiv = document.getElementById("fotos");
  fotosDiv.innerHTML = `<h3 style="color:#1f4e8c;">Imágenes</h3>`;

  if (!esPublico) {
    fotosDiv.innerHTML += `
      <input type="file" id="inputFotos" accept="image/*" multiple />
      <button id="btnGuardar">Guardar imágenes y generar link</button>
      <p id="estado"></p>
      <div id="link"></div>
    `;

    document.getElementById("inputFotos").addEventListener("change", onSeleccionFotos);
    document.getElementById("btnGuardar").addEventListener("click", guardarImagenes);
  }

  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => renderImagen(url));
  }
}

/**********************
 * SELECCIÓN DE FOTOS
 **********************/
function onSeleccionFotos(e) {
  const archivos = Array.from(e.target.files);
  if (!archivos.length) return;

  archivos.forEach(file => {
    imagenesPendientes.push(file);
    const preview = URL.createObjectURL(file);
    renderImagen(preview, true);
  });

  e.target.value = "";
}

/**********************
 * SUBIR Y GUARDAR
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
      const url = await getDownloadURL(storageRef);

      await updateDoc(refEnsayo, {
        fotos: arrayUnion(url)
      });
    }

    estado.textContent = "Imágenes guardadas correctamente ✅";
    mostrarLink();
    imagenesPendientes = [];

  } catch (err) {
    console.error(err);
    estado.textContent = "❌ Error al guardar imágenes";
  } finally {
    subiendo = false;
    btn.disabled = false;
  }
}

/**********************
 * RENDER IMG
 **********************/
function renderImagen(url, preview = false) {
  const img = document.createElement("img");
  img.src = url;
  img.style.maxWidth = "480px";
  img.style.display = "block";
  img.style.marginBottom = "16px";
  img.style.borderRadius = "12px";
  img.style.opacity = preview ? "0.6" : "1";
  document.getElementById("fotos").appendChild(img);
}

/**********************
 * LINK CLIENTE
 **********************/
function mostrarLink() {
  const link =
    `${window.location.origin}/INLACT/ensayo.html?id=${ensayoId}&publico=1`;

  document.getElementById("link").innerHTML = `
    <p><strong>Link para el cliente</strong></p>
    <input type="text" value="${link}" readonly style="width:100%" />
  `;
}
