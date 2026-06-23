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
  getDownloadURL,
  deleteObject
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
 * PARAMETROS URL
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");
const esPublico = params.get("publico") === "1";

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

    const contenedor = document.getElementById(id);
    contenedor.innerHTML = `
      <h3 style="color:#1f4e8c; margin-bottom:16px;">${titulos[id]}</h3>
      <p>${data[campo] || ""}</p>
    `;
  });

  /**********************
   * IMÁGENES
   **********************/
  const fotosDiv = document.getElementById("fotos");
  fotosDiv.innerHTML = `
    <h3 style="color:#1f4e8c; margin-bottom:16px;">Imágenes</h3>
  `;

  // Input SOLO si NO es público
  if (!esPublico) {
    fotosDiv.innerHTML += `
      <input 
        type="file"
        id="inputFotos"
        accept="image/*"
        multiple
        style="margin-bottom:16px;"
      />
    `;
  }

  // 🔴 ESTO ES LO QUE FALTABA: CARGA SIEMPRE LAS IMÁGENES
  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => agregarImagen(url, !esPublico));
  }

  if (!esPublico) {
    document
      .getElementById("inputFotos")
      .addEventListener("change", subirFotos);
  }
}

/**********************
 * SUBIR FOTOS
 **********************/
async function subirFotos(e) {
  const archivos = Array.from(e.target.files);
  if (!archivos.length) return;

  const refEnsayo = doc(db, "ensayos", ensayoId);

  for (const archivo of archivos) {
    const previewUrl = URL.createObjectURL(archivo);
    const imgPreview = agregarImagen(previewUrl, true);

    const storageRef = ref(
      storage,
      `ensayos/${ensayoId}/${Date.now()}_${archivo.name}`
    );

    await uploadBytes(storageRef, archivo);
    const urlFinal = await getDownloadURL(storageRef);

    await updateDoc(refEnsayo, {
      fotos: arrayUnion(urlFinal)
    });

    imgPreview.src = urlFinal;
  }

  e.target.value = "";
}

/**********************
 * AGREGAR IMAGEN
 **********************/
function agregarImagen(url, editable) {
  const fotosDiv = document.getElementById("fotos");

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.marginBottom = "16px";

  const img = document.createElement("img");
  img.src = url;
  img.style.maxWidth = "100%";

  wrapper.appendChild(img);

  // Cruz SOLO si es editable
  if (editable) {
    const cruz = document.createElement("span");
    cruz.textContent = "✕";
    cruz.style.position = "absolute";
    cruz.style.top = "6px";
    cruz.style.right = "10px";
    cruz.style.cursor = "pointer";
    cruz.style.fontSize = "18px";
    cruz.style.fontWeight = "bold";

    cruz.onclick = () => wrapper.remove();
    wrapper.appendChild(cruz);
  }

  fotosDiv.appendChild(wrapper);
  return img;
}

cargarEnsayo();

/**********************
 * SCROLL MENU
 **********************/
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.seccion;
    const destino = document.getElementById(id);
    if (destino) {
      destino.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
