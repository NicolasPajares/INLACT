/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
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
 * PARSING URL
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
      <input type="file" id="inputFotos" accept="image/*" multiple style="margin-bottom:16px;" />
    `;
    document.getElementById("inputFotos").addEventListener("change", subirFotos);
  }

  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => renderImagen(url));
  }

  if (!esPublico) {
    agregarBotonLink();
  }
}

/**********************
 * SUBIR FOTOS (CORREGIDO DEFINITIVO)
 **********************/
async function subirFotos(e) {
  const archivos = Array.from(e.target.files);
  if (!archivos.length) return;

  const refEnsayo = doc(db, "ensayos", ensayoId);

  for (const archivo of archivos) {
    try {
      // preview inmediato
      const previewUrl = URL.createObjectURL(archivo);
      const imgPreview = renderImagen(previewUrl);

      const storageRef = ref(
        storage,
        `ensayos/${ensayoId}/${Date.now()}_${archivo.name}`
      );

      await uploadBytes(storageRef, archivo);
      const urlFinal = await getDownloadURL(storageRef);

      // SIEMPRE arrayUnion (NO leer doc, NO pisar datos)
      await updateDoc(refEnsayo, {
        fotos: arrayUnion(urlFinal)
      });

      imgPreview.src = urlFinal;

    } catch (err) {
      console.error("Error subiendo imagen:", err);
      alert("Error al subir una imagen");
    }
  }

  e.target.value = "";
}

/**********************
 * RENDER IMAGEN
 **********************/
function renderImagen(url) {
  const fotosDiv = document.getElementById("fotos");

  const img = document.createElement("img");
  img.src = url;
  img.style.width = "100%";
  img.style.maxWidth = "480px";
  img.style.display = "block";
  img.style.marginBottom = "16px";
  img.style.borderRadius = "12px";

  fotosDiv.appendChild(img);
  return img;
}

/**********************
 * BOTÓN LINK CLIENTE
 **********************/
function agregarBotonLink() {
  const fotosDiv = document.getElementById("fotos");

  const btn = document.createElement("button");
  btn.textContent = "Guardar y generar link para cliente";
  btn.style.marginTop = "32px";

  const linkDiv = document.createElement("div");
  linkDiv.style.marginTop = "16px";

  btn.addEventListener("click", () => {
    const linkCliente =
      `${window.location.origin}/INLACT/ensayo.html?id=${ensayoId}&publico=1`;

    linkDiv.innerHTML = `
      <p><strong>Link para el cliente:</strong></p>
      <input type="text" value="${linkCliente}" readonly style="width:100%; padding:8px;" />
    `;
  });

  fotosDiv.appendChild(btn);
  fotosDiv.appendChild(linkDiv);
}

/**********************
 * SCROLL MENÚ
 **********************/
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.seccion;
    const destino = document.getElementById(id);
    if (destino) destino.scrollIntoView({ behavior: "smooth" });
  });
});

cargarEnsayo();
