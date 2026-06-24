/**********************
 * FIREBASE IMPORTS
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**********************
 * CONFIG FIREBASE
 **********************/
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.firebasestorage.app", // ✅ BUCKET CORRECTO
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

/**********************
 * AUTENTICACIÓN ANÓNIMA
 **********************/
signInAnonymously(auth)
  .then(() => {
    console.log("Auth anónima OK");
    cargarEnsayo();
  })
  .catch((err) => {
    console.error("Error auth:", err);
    cargarEnsayo();
  });

/**********************
 * CARGAR ENSAYO
 **********************/
async function cargarEnsayo() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const esPublico = params.get("publico") === "1";

  if (!id) return;

  const refEnsayo = doc(db, "ensayos", id);
  const snap = await getDoc(refEnsayo);

  if (!snap.exists()) return;

  const data = snap.data();
  const fotosDiv = document.getElementById("fotos");

  fotosDiv.innerHTML = "<h3>Imágenes</h3>";

  // Mostrar imágenes existentes
  if (data.fotos && data.fotos.length > 0) {
    data.fotos.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "150px";
      img.style.margin = "5px";
      fotosDiv.appendChild(img);
    });
  }

  // 👉 SOLO EN VISTA PRIVADA
  if (!esPublico) {
    fotosDiv.innerHTML += `
      <input type="file" id="inputFoto" accept="image/*"><br><br>
      <button id="btnGuardarFoto">Guardar imagen</button>
      <p id="estadoSubida"></p>
    `;

    const input = document.getElementById("inputFoto");
    const btn = document.getElementById("btnGuardarFoto");
    const estado = document.getElementById("estadoSubida");

    let archivo = null;

    input.addEventListener("change", () => {
      archivo = input.files[0];
      if (archivo) {
        estado.textContent = "Imagen seleccionada ✔️";
      }
    });

    btn.addEventListener("click", async () => {
      if (!archivo) {
        alert("Seleccioná una imagen");
        return;
      }

      estado.textContent = "Subiendo imagen...";

      try {
        const nombre = `ensayos/${id}/${Date.now()}_${archivo.name}`;
        const storageRef = ref(storage, nombre);

        await uploadBytes(storageRef, archivo);
        const url = await getDownloadURL(storageRef);

        const nuevasFotos = data.fotos ? [...data.fotos, url] : [url];

        await updateDoc(refEnsayo, {
          fotos: nuevasFotos
        });

        estado.textContent = "Imagen guardada ✅";
        location.reload();

      } catch (e) {
        console.error(e);
        estado.textContent = "Error al subir imagen ❌";
      }
    });
  }
}
