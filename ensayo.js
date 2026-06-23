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

const params = new URLSearchParams(window.location.search);
const ensayoId = params.get("id");

/* SCROLL MENU */
document.querySelectorAll(".menu-ensayo button").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .getElementById(btn.dataset.seccion)
      .scrollIntoView({ behavior: "smooth" });
  });
});

/* CARGAR ENSAYO */
async function cargarEnsayo() {
  const snap = await getDoc(doc(db, "ensayos", ensayoId));
  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("empresa").textContent = data.clienteNombre || "";
  document.getElementById("nombre-ensayo").textContent = data.nombreEnsayo || "";
  document.getElementById("fecha").textContent =
    data.fecha?.toDate().toLocaleDateString();

  const map = {
    propuesta: "propuesta",
    dosis: "dosis",
    elaboracion: "elaboracion",
    resultados: "resultados",
    conclusion: "conclusion",
    propuestacomercial: "propuestaComercial"
  };

  Object.keys(map).forEach(id => {
    document.querySelector(`#${id} .contenido`).textContent =
      data[map[id]] || "";
  });

  const fotosDiv = document.querySelector("#fotos .fotos");
  fotosDiv.innerHTML = "";

  if (data.fotos?.length) {
    data.fotos.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      fotosDiv.appendChild(img);
    });
  }
}

cargarEnsayo();
