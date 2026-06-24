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
 * CONFIG
 **********************/
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
  fotosDiv.innerHTML = `<h3 style="color:#1f4e8c; margin-bottom:16px;">Imágenes</h3>`;

  // Imágenes existentes
  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => renderImagen(url));
  }

  if (!esPublico) {
    fotosDiv.innerHTML += `
      <input type="file" id="inputFotos" accept="image/*" multiple style="margin-bottom:16px;" />
      <button id="btnGuardarFotos">Guardar imágenes</button>
      <p id="estadoFotos" style="margin-top:12px;"></p>
      <div id="linkCliente" style="margin-top:16px;"></div>
    `;

    document
      .getElementById("inputFotos")
      .addEventListener("change", seleccionarFotos);

    document
      .getElementById("btnGuardarFotos")
      .addEventListener("click", guardarFotos);
  }
}

/**********************
 * SELECCIONAR FOTOS
 **********************/
function seleccionarFotos(e) {
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
 * GUARDAR FOTOS
 **********************/
async function guardarFotos() {
  if (subiendo || !imagenesPendientes.length) return;

  subiendo = true;
  const estado = document.getElementById("estadoFotos");
  const btn = document.getElementById("btnGuardarFotos");

  btn.disabled = true;
  estado.textContent = "Guardando imágenes…";

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

    estado.textContent = "Imágenes guardadas correctamente ✅";
    imagenesPendientes = [];
    mostrarLinkCliente();

  } catch (err) {
    console.error(err);
    estado.textContent = "❌ Error al guardar imágenes";
    alert("Error subiendo imágenes. Revisá la consola.");
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
  img.style.maxWidth = "480px";
  img.style.width = "100%";
  img.style.display = "block";
  img.style.marginBottom = "16px";
  img.style.borderRadius = "12px";
  img.style.opacity = preview ? "0.6" : "1";

  fotosDiv.appendChild(img);
}

/**********************
 * LINK CLIENTE
 **********************/
function mostrarLinkCliente() {
  const linkDiv = document.getElementById("linkCliente");
  const link =
    `${window.location.origin}/INLACT/ensayo.html?id=${ensayoId}&publico=1`;

  linkDiv.innerHTML = `
    <p><strong>Link para el cliente:</strong></p>
    <input type="text" value="${link}" readonly style="width:100%; padding:8px;" />
  `;
}

/**********************
 * MENÚ SCROLL
 **********************/
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const destino = document.getElementById(btn.dataset.seccion);
    if (destino) destino.scrollIntoView({ behavior: "smooth" });
  });
});

/**********************
 * AUTENTICACIÓN + INIT
 **********************/
signInAnonymously(auth)
  .then(() => {
    console.log("Sesión anónima iniciada ✅");
    cargarEnsayo();
  })
  .catch(err => {
    console.error("Error autenticando:", err);
    alert("No se pudo iniciar sesión. Recargá la página.");
  });
