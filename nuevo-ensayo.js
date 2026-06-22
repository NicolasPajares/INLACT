import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  // TU CONFIG ACTUAL (NO LA CAMBIO)
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("form-ensayo");
const inputFoto = document.getElementById("foto");

function convertirABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let fotoBase64 = "";

  if (inputFoto.files.length > 0) {
    fotoBase64 = await convertirABase64(inputFoto.files[0]);
  }

  const data = {
    empresa: form.empresa.value,
    nombreEnsayo: form.nombreEnsayo.value,
    propuesta: form.propuesta.value,
    dosis: form.dosis.value,
    elaboracion: form.elaboracion.value,
    resultados: form.resultados.value,
    conclusion: form.conclusion.value,
    propuestaComercial: form.propuestaComercial.value,
    foto: fotoBase64, // ✅ AHORA SÍ SE GUARDA
    fecha: Timestamp.now()
  };

  await addDoc(collection(db, "ensayos"), data);

  alert("Ensayo guardado correctamente");
  form.reset();
});
