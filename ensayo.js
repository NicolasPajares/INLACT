/******************************
 * FIREBASE CONFIG
 ******************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

/******************************
 * INIT
 ******************************/
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/******************************
 * ENSAYO ID
 ******************************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");

if (!ensayoId) {
  alert("No se encontró el ID del ensayo");
}

/******************************
 * AUTH
 ******************************/
signInAnonymously(auth).catch(err => {
  console.error("Error auth:", err);
});

onAuthStateChanged(auth, user => {
  if (user) {
    mostrarFormulario();
  }
});

/******************************
 * UI
 ******************************/
function mostrarFormulario() {
  const contenedor = document.getElementById("imagenesEnsayo");

  if (!contenedor) {
    console.error("No existe #imagenesEnsayo en el HTML");
    return;
  }

  contenedor.innerHTML = `
    <h3>Cargar imagen</h3>
    <input type="file" id="fotoInput" accept="image/*" />
    <button id="btnSubir">Subir imagen</button>
    <p id="estadoSubida"></p>
  `;

  document
    .getElementById("btnSubir")
    .addEventListener("click", subirImagen);
}

/******************************
 * UPLOAD
 ******************************/
async function subirImagen() {
  const input = document.getElementById("fotoInput");
  const estado = document.getElementById("estadoSubida");

  if (!input.files.length) {
    alert("Seleccioná una imagen");
    return;
  }

  const archivo = input.files[0];
  const nombre = `${Date.now()}_${archivo.name}`;

  estado.textContent = "Subiendo imagen...";

  try {
    const ruta = `ensayos/${ensayoId}/${nombre}`;
    const storageRef = ref(storage, ruta);

    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);

    await updateDoc(doc(db, "ensayos", ensayoId), {
      imagenes: arrayUnion({
        url,
        fecha: new Date()
      })
    });

    estado.innerHTML = `
      Imagen subida ✔️ <br>
      <a href="${url}" target="_blank">Ver imagen</a>
    `;

    input.value = "";

  } catch (err) {
    console.error(err);
    estado.textContent = "❌ Error al subir la imagen";
  }
}
function mostrarLinkCliente() {
  const linkDiv = document.getElementById("linkCliente");

  const link =
    `${window.location.origin}/INLACT/ensayo.html?id=${ensayoId}&publico=1`;

  linkDiv.innerHTML = `
    <p><strong>Link para el cliente:</strong></p>
    <input 
      type="text" 
      value="${link}" 
      readonly 
      style="width:100%; padding:8px;"
      onclick="this.select()"
    />
  `;
}
