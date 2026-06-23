/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
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
 * OBTENER ID
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");

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
   * IMÁGENES + BOTÓN
   **********************/
  const fotosDiv = document.getElementById("fotos");
  fotosDiv.innerHTML = `
    <h3 style="color:#1f4e8c; margin-bottom:16px;">Imágenes</h3>
    <input 
      type="file"
      id="inputFotos"
      accept="image/*"
      multiple
      style="margin-bottom:16px;"
    />
  `;

  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => agregarImagen(url));
  }

  document
    .getElementById("inputFotos")
    .addEventListener("change", subirFotos);
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

    imgPreview.dataset.url = urlFinal;
    imgPreview.querySelector("img").src = urlFinal;
  }

  e.target.value = "";
}

/**********************
 * AGREGAR IMAGEN + CRUZ ELIMINAR
 **********************/
function agregarImagen(url, esPreview = false) {
  const fotosDiv = document.getElementById("fotos");

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.marginBottom = "16px";

  const img = document.createElement("img");
  img.src = url;
  img.style.width = "100%";
  img.style.maxWidth = "480px";
  img.style.display = "block";
  img.style.borderRadius = "12px";

  const cerrar = document.createElement("button");
  cerrar.textContent = "✕";
  cerrar.style.position = "absolute";
  cerrar.style.top = "6px";
  cerrar.style.right = "6px";
  cerrar.style.border = "none";
  cerrar.style.cursor = "pointer";
  cerrar.style.fontSize = "16px";
  cerrar.style.lineHeight = "1";
  cerrar.style.background = "rgba(0,0,0,0.6)";
  cerrar.style.color = "#fff";
  cerrar.style.borderRadius = "50%";
  cerrar.style.width = "24px";
  cerrar.style.height = "24px";

  cerrar.addEventListener("click", async () => {
    const urlImagen = wrapper.dataset.url;
    wrapper.remove();

    if (!urlImagen) return;

    const refEnsayo = doc(db, "ensayos", ensayoId);

    await updateDoc(refEnsayo, {
      fotos: arrayRemove(urlImagen)
    });

    try {
      const storageRef = ref(storage, urlImagen);
      await deleteObject(storageRef);
    } catch (e) {
      // si falla borrar en storage no rompe nada
    }
  });

  wrapper.appendChild(img);
  wrapper.appendChild(cerrar);
  wrapper.dataset.url = esPreview ? "" : url;

  fotosDiv.appendChild(wrapper);
  return wrapper;
}

cargarEnsayo();

/**********************
 * SCROLL MENÚ IZQUIERDO
 **********************/
document.querySelectorAll(".menu-ensayo button").forEach(boton => {
  boton.addEventListener("click", () => {
    const id = boton.dataset.seccion;
    const destino = document.getElementById(id);
    if (destino) {
      destino.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
