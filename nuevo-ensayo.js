/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/**********************
 * CONFIG
 **********************/
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

/**********************
 * INIT
 **********************/
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/**********************
 * FORM
 **********************/
const form = document.getElementById("form-ensayo");

const fecha = document.getElementById("fecha");
const cliente = document.getElementById("cliente");
const producto = document.getElementById("producto");
const lote = document.getElementById("lote");
const analisis = document.getElementById("analisis");
const resultado = document.getElementById("resultado");
const observaciones = document.getElementById("observaciones");
const propuesta = document.getElementById("propuesta");
const fotosInput = document.getElementById("fotos");

/**********************
 * SUBMIT
 **********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const archivos = fotosInput.files;
    const urlsFotos = [];

    if (archivos.length > 0) {
      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];

        const storageRef = ref(
          storage,
          `ensayos/${Date.now()}_${archivo.name}`
        );

        await uploadBytes(storageRef, archivo);
        const url = await getDownloadURL(storageRef);
        urlsFotos.push(url);
      }
    }

    await addDoc(collection(db, "ensayos"), {
      fecha: Timestamp.fromDate(new Date(fecha.value)),
      cliente: cliente.value,
      producto: producto.value,
      lote: lote.value,
      analisis: analisis.value,
      resultado: resultado.value,
      observaciones: observaciones.value,
      propuesta: propuesta.value,
      fotos: urlsFotos,
      creado: Timestamp.now()
    });

    alert("Ensayo guardado correctamente");
    form.reset();

  } catch (error) {
    console.error("Error al guardar el ensayo:", error);
    alert("Error al guardar el ensayo");
  }
});
