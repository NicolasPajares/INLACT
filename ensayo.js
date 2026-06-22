/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
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
 * CARGAR ENSAYO
 **********************/
const ensayoRef = doc(db, "ensayos", ensayoId);
const snap = await getDoc(ensayoRef);

if (!snap.exists()) {
  alert("Ensayo inexistente");
  throw new Error("No existe el ensayo");
}

const ensayo = snap.data();

/**********************
 * RENDER DATOS
 **********************/
document.getElementById("empresa").textContent = ensayo.clienteNombre || "";
document.getElementById("nombre-ensayo").textContent = ensayo.nombreEnsayo || "";

if (ensayo.fecha) {
  document.getElementById("fecha").textContent =
    ensayo.fecha.toDate().toLocaleDateString("es-AR");
}

document.getElementById("propuesta").textContent = ensayo.propuesta || "";
document.getElementById("dosis").textContent = ensayo.dosis || "";
document.getElementById("elaboracion").textContent = ensayo.elaboracion || "";
document.getElementById("resultados").textContent = ensayo.resultados || "";
document.getElementById("conclusion").textContent = ensayo.conclusion || "";
document.getElementById("propuestacomercial").textContent =
  ensayo.propuestaComercial || "";

/**********************
 * RENDER FOTOS
 **********************/
const fotosSection = document.getElementById("fotos");

if (ensayo.fotos && ensayo.fotos.length > 0) {
  ensayo.fotos.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "200px";
    img.style.margin = "10px";
    fotosSection.appendChild(img);
  });
}

/**********************
 * FORM SUBIR FOTOS
 **********************/
const uploadForm = document.createElement("form");
uploadForm.innerHTML = `
  <input type="file" id="nuevasFotos" multiple accept="image/*">
  <button type="submit">Subir imágenes</button>
`;
fotosSection.appendChild(uploadForm);

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("nuevasFotos");
  if (input.files.length === 0) return;

  const nuevasURLs = [...(ensayo.fotos || [])];

  for (const file of input.files) {
    const fotoRef = ref(
      storage,
      `ensayos/${ensayoId}/${Date.now()}_${file.name}`
    );

    await uploadBytes(fotoRef, file);
    const url = await getDownloadURL(fotoRef);
    nuevasURLs.push(url);
  }

  await updateDoc(ensayoRef, {
    fotos: nuevasURLs,
    actualizadoEn: Timestamp.now()
  });

  location.reload();
});
