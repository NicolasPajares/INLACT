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
  // TU CONFIG
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/**********************
 * FORM
 **********************/
const form = document.getElementById("formNuevoEnsayo");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const cliente = document.getElementById("cliente").value;
    const fecha = document.getElementById("fecha").value;
    const nombre = document.getElementById("nombreEnsayo").value;
    const propuesta = document.getElementById("propuesta").value;
    const dosis = document.getElementById("dosis").value;
    const elaboracion = document.getElementById("elaboracion").value;
    const resultados = document.getElementById("resultados").value;
    const fotosInput = document.getElementById("fotos");

    let fotosURLs = [];

    // 🔥 SUBIR FOTOS
    if (fotosInput.files.length > 0) {
      for (const file of fotosInput.files) {
        const storageRef = ref(
          storage,
          `ensayos/${Date.now()}_${file.name}`
        );

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        fotosURLs.push(url);
      }
    }

    // 🔥 GUARDAR ENSAYO
    await addDoc(collection(db, "ensayos"), {
      cliente,
      fecha,
      nombre,
      propuesta,
      dosis,
      elaboracion,
      resultados,
      fotos: fotosURLs,
      creado: Timestamp.now()
    });

    alert("✅ Ensayo guardado correctamente");
    location.href = "ensayos.html";

  } catch (error) {
    console.error(error);
    alert("❌ Error al guardar el ensayo");
  }
}); y 
