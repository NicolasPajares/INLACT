import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/**********************
 * FIREBASE
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

/**********************
 * DOM
 **********************/
const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");
const fotoEl = document.getElementById("fotoEnsayo");

/**********************
 * CARGAR CLIENTES (NO SE TOCA)
 **********************/
async function cargarClientes() {
  const snap = await getDocs(collection(db, "clientes"));
  snap.forEach(d => {
    const o = document.createElement("option");
    o.value = d.id;
    o.textContent = d.data().nombre || "Cliente sin nombre";
    o.dataset.nombre = d.data().nombre || "";
    selectCliente.appendChild(o);
  });
}

cargarClientes();

/**********************
 * GUARDAR ENSAYO
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const clienteOption =
      selectCliente.options[selectCliente.selectedIndex];

    // 1️⃣ Crear ensayo base
    const docRef = await addDoc(collection(db, "ensayos"), {
      clienteId: selectCliente.value,
      clienteNombre: clienteOption.dataset.nombre,
      nombreEnsayo: nombreEnsayo.value,
      fecha: Timestamp.fromDate(new Date(fecha.value)),

      propuesta: propuesta.value || "",
      dosis: dosis.value || "",
      elaboracion: elaboracion.value || "",
      resultados: resultados.value || "",
      conclusion: conclusion.value || "",
      propuestaComercial: propuestaComercial.value || "",

      fotos: [],
      creadoEn: Timestamp.now()
    });

    // 2️⃣ Subir foto SOLO si existe
    if (fotoEl.files.length > 0) {
      const file = fotoEl.files[0];

      const storageRef = ref(
        storage,
        `ensayos/${docRef.id}/${Date.now()}_${file.name}`
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "ensayos", docRef.id), {
        fotos: [url]
      });
    }

    // 3️⃣ Redirigir
    window.location.href = `ensayo.html?id=${docRef.id}`;

  } catch (err) {
    console.error(err);
    alert("Error al guardar el ensayo");
  }
});
