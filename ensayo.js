/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

/**********************
 * OBTENER ID
 **********************/
const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");

/**********************
 * CARGAR ENSAYO
 **********************/
async function cargarEnsayo() {
  if (!ensayoId) return;

  const refEnsayo = doc(db, "ensayos", ensayoId);
  const snap = await getDoc(refEnsayo);
  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("empresa").textContent = data.clienteNombre || "";
  document.getElementById("nombre-ensayo").textContent = data.nombreEnsayo || "";
  document.getElementById("fecha").textContent =
    data.fecha?.toDate().toLocaleDateString() || "";

  const secciones = [
    "propuesta",
    "dosis",
    "elaboracion",
    "resultados",
    "conclusion",
    "propuestacomercial"
  ];

  const titulos = {
    propuesta: "Propuesta",
    dosis: "Dosis",
    elaboracion: "Elaboración",
    resultados: "Resultados",
    conclusion: "Conclusión",
    propuestacomercial: "Propuesta comercial"
  };

  secciones.forEach(id => {
    const campo = id === "propuestacomercial"
      ? "propuestaComercial"
      : id;

    const contenido = data[campo] || "";
    const contenedor = document.getElementById(id);

    contenedor.innerHTML = `
      <h3 style="color:#1f4e8c; margin-bottom:16px;">
        ${titulos[id]}
      </h3>
      <p>${contenido}</p>
    `;
  });

  const fotosDiv = document.getElementById("fotos");
  fotosDiv.innerHTML = "";

  if (Array.isArray(data.fotos)) {
    data.fotos.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      fotosDiv.appendChild(img);
    });
  }
}

cargarEnsayo();

/**********************
 * SCROLL MENU
 **********************/
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.seccion;
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
