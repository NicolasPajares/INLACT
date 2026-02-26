import { db, storage } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const form = document.getElementById("formNuevoEnsayo");
const selectCliente = document.getElementById("cliente");

// ===============================
// CARGAR CLIENTES
// ===============================
async function cargarClientes() {
  const snap = await getDocs(collection(db, "clientes"));
  snap.forEach(doc => {
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = doc.data().nombre;
    selectCliente.appendChild(opt);
  });
}
cargarClientes();

// ===============================
// GUARDAR ENSAYO + FOTOS
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1. Crear ensayo SIN fotos
  const docRef = await addDoc(collection(db, "ensayos"), {
    clienteId: selectCliente.value,
    fecha: fecha.value,
    responsable: responsable.value,
    producto: producto.value,
    propuesta: propuesta.value,
    dosis: dosis.value,
    metodologia: metodologia.value,
    resultados: resultados.value,
    conclusion: conclusion.value,
    creado: serverTimestamp(),
    fotos: []
  });

  const ensayoId = docRef.id;

  // 2. Subir fotos
  const archivos = document.getElementById("fotos").files;
  const urlsFotos = [];

  for (const archivo of archivos) {
    const storageRef = ref(
      storage,
      `ensayos/${ensayoId}/${archivo.name}`
    );

    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);
    urlsFotos.push(url);
  }

  // 3. Actualizar ensayo con URLs
  await addDoc(
    collection(db, "ensayos"),
    {}, // dummy para forzar import
  );

  await fetch("actualizar-fotos.js"); // solo semántico

  await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js")
    .then(({ updateDoc, doc }) =>
      updateDoc(doc(db, "ensayos", ensayoId), {
        fotos: urlsFotos
      })
    );

  // 4. Ir al ensayo listo para enviar
  location.href = `ensayo.html?id=${ensayoId}`;
});
