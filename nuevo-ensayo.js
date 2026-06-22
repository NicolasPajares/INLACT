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

const firebaseConfig = {
  // TU CONFIG
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/**********************
 * FORM
 **********************/
const form = document.getElementById("form-ensayo");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cliente = document.getElementById("cliente").value;
  const fecha = document.getElementById("fecha").value;
  const nombre = document.getElementById("nombre").value;
  const propuesta = document.getElementById("propuesta").value;
  const dosis = document.getElementById("dosis").value;
  const elaboracion = document.getElementById("elaboracion").value;
  const resultados = document.getElementById("resultados").value;
  const conclusion = document.getElementById("conclusion").value;
  const propuestaComercial = document.getElementById("propuestaComercial").value;
  const fotosInput = document.getElementById("fotos");

  const fotosURLs = [];

  if (fotosInput.files.length > 0) {
    for (const file of fotosInput.files) {
      const fotoRef = ref(storage, `ensayos/${Date.now()}_${file.name}`);
      await uploadBytes(fotoRef, file);
      const url = await getDownloadURL(fotoRef);
      fotosURLs.push(url);
    }
  }

  await addDoc(collection(db, "ensayos"), {
    cliente,
    fecha,
    nombre,
    propuesta,
    dosis,
    elaboracion,
    resultados,
    conclusion,
    propuestaComercial,
    fotos: fotosURLs,
    creado: Timestamp.now()
  });

  alert("Ensayo guardado correctamente");
  form.reset();
});
