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
    { id: "propuesta", titulo: "Propuesta" },
    { id: "dosis", titulo: "Dosis" },
    { id: "elaboracion", titulo: "Elaboración" },
    { id: "resultados", titulo: "Resultados" },
    { id: "conclusion", titulo: "Conclusión" },
    { id: "propuestacomercial", titulo: "Propuesta comercial" }
  ];

  secciones.forEach(sec => {
    const campo = sec.id === "propuestacomercial"
      ? "propuestaComercial"
      : sec.id;

    const contenedor = document.getElementById(sec.id);
    contenedor.innerHTML = "";

    const h3 = document.createElement("h3");
    h3.textContent = sec.titulo;
    h3.style.color = "#1f4e8c";

    const p = document.createElement("p");
    p.textContent = data[campo] || "";

    contenedor.appendChild(h3);
    contenedor.appendChild(p);
  });

  const fotosDiv = document.getElementById("fotos");
  fotosDiv.innerHTML = "";

  const h3Fotos = document.createElement("h3");
  h3Fotos.textContent = "Imágenes";
  h3Fotos.style.color = "#1f4e8c";
  fotosDiv.appendChild(h3Fotos);

  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => {
      agregarImagen(url);
    });
  }

  agregarInputFotos();
}

cargarEnsayo();

/**********************
 * AGREGAR INPUT DE FOTOS
 **********************/
function agregarInputFotos() {
  const fotosDiv = document.getElementById("fotos");

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.style.marginTop = "16px";

  input.addEventListener("change", async () => {
    const files = Array.from(input.files);
    for (const file of files) {
      await subirFoto(file);
    }
    input.value = "";
  });

  fotosDiv.appendChild(input);
}

/**********************
 * SUBIR FOTO
 **********************/
async function subirFoto(file) {
  if (!ensayoId) return;

  const storageRef = ref(
    storage,
    `ensayos/${ensayoId}/${Date.now()}_${file.name}`
  );

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const refEnsayo = doc(db, "ensayos", ensayoId);
  await updateDoc(refEnsayo, {
    fotos: arrayUnion(url)
  });

  agregarImagen(url);
}

/**********************
 * AGREGAR IMAGEN (ÚNICA CORRECCIÓN)
 **********************/
function agregarImagen(url) {
  const fotosDiv = document.getElementById("fotos");

  const img = document.createElement("img");
  img.src = url;

  /* 👇 SOLO ESTO CAMBIA */
  img.style.width = "100%";
  img.style.maxWidth = "420px";
  img.style.display = "block";
  img.style.marginBottom = "16px";
  img.style.borderRadius = "12px";

  fotosDiv.appendChild(img);
}

/**********************
 * SCROLL MENU
 **********************/
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.seccion;
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
