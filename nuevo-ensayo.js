/**********************
 * IMPORTS FIREBASE
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
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.appspot.com",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:XXXX"
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
const form = document.getElementById("formNuevoEnsayo");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // ====== CAMPOS ======
    const cliente = document.getElementById("cliente").value;
    const observaciones = document.getElementById("observaciones").value;
    const fileInput = document.getElementById("foto");

    let imageUrl = "";

    // ====== STORAGE (SOLO SI HAY FOTO) ======
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      const storageRef = ref(
        storage,
        `ensayos/${Date.now()}_${file.name}`
      );

      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    // ====== FIRESTORE ======
    await addDoc(collection(db, "ensayos"), {
      cliente: cliente,
      observaciones: observaciones,
      imagen: imageUrl,
      createdAt: Timestamp.now()
    });

    alert("Ensayo guardado correctamente");
    form.reset();

  } catch (error) {
    console.error("Error al guardar ensayo:", error);
    alert("Error al guardar el ensayo");
  }
});
