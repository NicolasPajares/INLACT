/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

/**********************
 * DOM
 **********************/
const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");

const fechaEl = document.getElementById("fecha");
const nombreEnsayoEl = document.getElementById("nombreEnsayo");
const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const elaboracionEl = document.getElementById("elaboracion");
const resultadosEl = document.getElementById("resultados");
const conclusionEl = document.getElementById("conclusion");
const propuestaComercialEl = document.getElementById("propuestaComercial");
const fotosInput = document.getElementById("fotos");

/**********************
 * CARGAR CLIENTES
 **********************/
async function cargarClientes() {
  const snap = await getDocs(collection(db, "clientes"));

  snap.forEach(docu => {
    const cliente = docu.data();
    const option = document.createElement("option");
    option.value = docu.id;
    option.textContent = cliente.nombre || "Cliente sin nombre";
    option.dataset.nombre = cliente.nombre || "";
    selectCliente.appendChild(option);
  });
}

/**********************
 * IMAGEN A BASE64 COMPRIMIDA
 **********************/
function imagenABase64Comprimida(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let w = img.width;
        let h = img.height;

        const MAX = 1280;
        const QUALITY = 0.6;

        if (w > h && w > MAX) {
          h *= MAX / w;
          w = MAX;
        } else if (h > MAX) {
          w *= MAX / h;
          h = MAX;
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };

      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**********************
 * PROCESAR FOTOS
 **********************/
async function procesarFotos(files) {
  const imagenes = [];

  if (!files || files.length === 0) return imagenes;

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    try {
      const base64 = await imagenABase64Comprimida(file);
      imagenes.push(base64);
    } catch (e) {
      console.error("Error procesando imagen", e);
    }
  }

  return imagenes;
}

/**********************
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const clienteOption =
      selectCliente.options[selectCliente.selectedIndex];

    const fotosBase64 = await procesarFotos(fotosInput.files);

    const nuevoEnsayo = {
      clienteId: selectCliente.value,
      clienteNombre: clienteOption.dataset.nombre,
      nombreEnsayo: nombreEnsayoEl.value,
      fecha: Timestamp.fromDate(new Date(fechaEl.value)),
      propuesta: propuestaEl.value || "",
      dosis: dosisEl.value || "",
      elaboracion: elaboracionEl.value || "",
      resultados: resultadosEl.value || "",
      conclusion: conclusionEl.value || "",
      propuestaComercial: propuestaComercialEl.value || "",
      fotos: fotosBase64,
      creadoEn: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, "ensayos"), nuevoEnsayo);

    window.location.href = `ensayo.html?id=${docRef.id}`;

  } catch (error) {
    console.error("Error guardando ensayo:", error);
    alert("Error al guardar el ensayo");
  }
});

/**********************
 * INIT
 **********************/
cargarClientes();
