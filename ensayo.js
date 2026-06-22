/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  updateDoc,
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
 * OBTENER ID ENSAYO
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");

if (!ensayoId) {
  alert("Ensayo no encontrado");
  throw new Error("Falta ID de ensayo");
}

/**********************
 * FORM
 **********************/
const form = document.getElementById("form-ensayo");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fotosInput = document.getElementById("fotos");
  const fotosURLs = [];

  try {
    if (fotosInput.files.length > 0) {
      for (const file of fotosInput.files) {
        const fotoRef = ref(
          storage,
          `ensayos/${ensayoId}/${Date.now()}_${file.name}`
        );

        await uploadBytes(fotoRef, file);
        const url = await getDownloadURL(fotoRef);
        fotosURLs.push(url);
      }

      await updateDoc(doc(db, "ensayos", ensayoId), {
        fotos: fotosURLs,
        actualizadoEn: Timestamp.now()
      });
    }

    alert("Fotos guardadas correctamente");
    form.reset();

  } catch (error) {
    console.error(error);
    alert("Error al guardar las fotos");
  }
});
