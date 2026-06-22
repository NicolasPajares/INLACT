import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  // TU CONFIG ACTUAL (NO LA CAMBIO)
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function cargarEnsayo() {
  const ref = doc(db, "ensayos", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("empresa").textContent = data.empresa;
  document.getElementById("nombre-ensayo").textContent = data.nombreEnsayo;
  document.getElementById("fecha").textContent =
    data.fecha.toDate().toLocaleDateString();

  document.getElementById("propuesta").textContent = data.propuesta;
  document.getElementById("dosis").textContent = data.dosis;
  document.getElementById("elaboracion").textContent = data.elaboracion;
  document.getElementById("resultados").textContent = data.resultados;
  document.getElementById("conclusion").textContent = data.conclusion;
  document.getElementById("propuestacomercial").textContent =
    data.propuestaComercial;

  if (data.foto) {
    const img = document.createElement("img");
    img.src = data.foto; // ✅ Base64 directo
    img.style.maxWidth = "100%";
    img.style.marginTop = "15px";
    document.getElementById("fotos").appendChild(img);
  }
}

cargarEnsayo();
