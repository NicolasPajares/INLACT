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
 * DOM
 **********************/
const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");
const fotosInput = document.getElementById("fotos");

const fechaEl = document.getElementById("fecha");
const nombreEnsayoEl = document.getElementById("nombreEnsayo");
const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const elaboracionEl = document.getElementById("elaboracion");
const resultadosEl = document.getElementById("resultados");
const conclusionEl = document.getElementById("conclusion");
const propuestaComercialEl = document.getElementById("propuestaComercial");

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
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const clienteOption =
      selectCliente.options[selectCliente.selectedIndex];

    // ✅ FECHA SEGURA
    const fechaValue = fechaEl.value;
    const fechaDate = fechaValue ? new Date(fechaValue) : null;

    if (!fechaDate || isNaN(fechaDate.getTime())) {
      alert("Fecha inválida");
      return;
    }

    // 1️⃣ Crear ensayo
    const nuevoEnsayo = {
      clienteId: selectCliente.value || "",
      clienteNombre: clienteOption?.dataset?.nombre || "",
      nombreEnsayo: nombreEnsayoEl.value || "",
      fecha: Timestamp.fromDate(fechaDate),

      propuesta: propuestaEl.value || "",
      dosis: dosisEl.value || "",
      elaboracion: elaboracionEl.value || "",
      resultados: resultadosEl.value || "",
      conclusion: conclusionEl.value || "",
      propuestaComercial: propuestaComercialEl.value || "",

      fotos: [],
      creadoEn: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, "ensayos"), nuevoEnsayo);

    // 2️⃣ Subir fotos (si hay)
    const fotosURLs = [];
    const files = fotosInput?.files || [];

    console.log("📸 Archivos seleccionados:", files);
console.log("📸 Cantidad:", files.length);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(
        storage,
        `ensayos/${docRef.id}/${Date.now()}_${file.name}`
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      fotosURLs.push(url);
    }

    // 3️⃣ Guardar URLs si hubo fotos
    if (fotosURLs.length > 0) {
      await addDoc(
        collection(db, "ensayos", docRef.id, "fotos"),
        { urls: fotosURLs }
      );
    }

    // 4️⃣ Redirigir
    window.location.href = `ensayo.html?id=${docRef.id}`;

  } catch (error) {
    console.error("🔥 ERROR REAL:", error);
    alert("Error al guardar el ensayo");
  }
});

/**********************
 * INIT
 **********************/
cargarClientes();
