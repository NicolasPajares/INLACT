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
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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

/**********************
 * URL
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");
const esPublico = params.get("publico") === "1";

let subidasPendientes = [];

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

  /**********************
   * IMÁGENES
   **********************/
  const fotosDiv = document.getElementById("fotos");
  fotosDiv.innerHTML = `<h3 style="color:#1f4e8c; margin-bottom:16px;">Imágenes</h3>`;

  if (!esPublico) {
    fotosDiv.innerHTML += `
      <input type="file" id="inputFotos" accept="image/*" multiple />
      <button id="btnGuardarFotos" style="margin-top:16px;">
        Guardar imágenes y generar link
      </button>
      <div id="estadoSubida" style="margin-top:12px;"></div>
    `;

    document
      .getElementById("inputFotos")
      .addEventListener("change", subirFotos);

    document
      .getElementById("btnGuardarFotos")
      .addEventListener("click", guardarYGenerarLink);
  }

  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => renderImagen(url));
  }
}

/**********************
 * SUBIR FOTOS (ROBUSTO)
 **********************/
function subirFotos(e) {
  const archivos = Array.from(e.target.files);
  if (!archivos.length) return;

  const refEnsayo = doc(db, "ensayos", ensayoId);
  subidasPendientes = [];

  archivos.forEach(archivo => {
    const promesa = new Promise(resolve => {
      const previewUrl = URL.createObjectURL(archivo);
      const imgPreview = renderImagen(previewUrl);

      const storageRef = ref(
        storage,
        `ensayos/${ensayoId}/${Date.now()}_${archivo.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, archivo);

      uploadTask.on(
        "state_changed",
        null,
        err => {
          console.error("Error Storage:", err);
          resolve(); // 🔥 nunca bloquear
        },
        async () => {
          try {
            const urlFinal = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDoc(refEnsayo, {
              fotos: arrayUnion(urlFinal)
            });
            imgPreview.src = urlFinal;
          } catch (e) {
            console.error("Error Firestore:", e);
          }
          resolve();
        }
      );
    });

    subidasPendientes.push(promesa);
  });
}

/**********************
 * GUARDAR + LINK
 **********************/
async function guardarYGenerarLink() {
  const estado = document.getElementById("estadoSubida");
  estado.textContent = "Guardando imágenes...";

  await Promise.all(subidasPendientes);

  const link =
    `${window.location.origin}/INLACT/ensayo.html?id=${ensayoId}&publico=1`;

  estado.innerHTML = `
    <p><strong>Link para el cliente:</strong></p>
    <input type="text" value="${link}" readonly style="width:100%; padding:8px;" />
  `;
}

/**********************
 * RENDER IMG
 **********************/
function renderImagen(url) {
  const fotosDiv = document.getElementById("fotos");

  const img = document.createElement("img");
  img.src = url;
  img.style.width = "100%";
  img.style.maxWidth = "480px";
  img.style.marginBottom = "16px";
  img.style.borderRadius = "12px";

  fotosDiv.appendChild(img);
  return img;
}

/**********************
 * SCROLL
 **********************/
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.seccion;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  });
});

cargarEnsayo();
