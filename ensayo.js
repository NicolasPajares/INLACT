/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
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
  authDomain: "TU_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_SENDER",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/**********************
 * URL PARAMS
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");
const publico = params.get("publico") === "1";

/**********************
 * ELEMENTOS EXISTENTES
 **********************/
const contenedorImagenes = document.getElementById("imagenes");
const inputImagen = document.getElementById("inputImagen");
const textarea = document.getElementById("texto");

/**********************
 * MODO PUBLICO (SOLO VER)
 **********************/
if (publico) {
  if (inputImagen) inputImagen.style.display = "none";
  if (textarea) textarea.setAttribute("disabled", true);
}

/**********************
 * IMAGENES EN MEMORIA
 **********************/
let imagenes = [];

/**********************
 * SUBIR IMAGEN
 **********************/
if (inputImagen && !publico) {
  inputImagen.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `ensayos/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    imagenes.push(url);
    renderImagenes();
    inputImagen.value = "";
  });
}

/**********************
 * RENDER IMAGENES
 **********************/
function renderImagenes() {
  contenedorImagenes.innerHTML = "";

  imagenes.forEach((url, index) => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const img = document.createElement("img");
    img.src = url;
    img.style.width = "100%";

    wrapper.appendChild(img);

    if (!publico) {
      const cerrar = document.createElement("span");
      cerrar.innerHTML = "✕";
      cerrar.style.position = "absolute";
      cerrar.style.top = "5px";
      cerrar.style.right = "5px";
      cerrar.style.cursor = "pointer";
      cerrar.style.fontSize = "18px";

      cerrar.onclick = () => {
        imagenes.splice(index, 1);
        renderImagenes();
      };

      wrapper.appendChild(cerrar);
    }

    contenedorImagenes.appendChild(wrapper);
  });
}

/**********************
 * BOTON GUARDAR
 **********************/
if (!publico) {
  const btnGuardar = document.createElement("button");
  btnGuardar.textContent = "Guardar ensayo";
  btnGuardar.style.marginTop = "15px";

  contenedorImagenes.after(btnGuardar);

  btnGuardar.addEventListener("click", async () => {
    const data = {
      texto: textarea.value,
      imagenes,
      fecha: Timestamp.now()
    };

    let docRef;

    if (ensayoId) {
      docRef = doc(db, "ensayos", ensayoId);
      await setDoc(docRef, data);
    } else {
      docRef = await addDoc(collection(db, "ensayos"), data);
    }

    const linkPublico =
      `${window.location.origin}${window.location.pathname}?id=${docRef.id}&publico=1`;

    alert("Link para el cliente:\n" + linkPublico);
  });
}

/**********************
 * CARGAR ENSAYO
 **********************/
if (ensayoId) {
  const docRef = doc(db, "ensayos", ensayoId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    textarea.value = data.texto || "";
    imagenes = data.imagenes || [];
    renderImagenes();
  }
}
