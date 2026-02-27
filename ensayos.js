/*************************
 * FIREBASE
 *************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
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

/*************************
 * ELEMENTOS DOM
 *************************/
const listaEnsayos = document.getElementById("listaEnsayos");
const buscador = document.getElementById("buscadorEnsayos");
const btnNuevoEnsayo = document.getElementById("btnNuevoEnsayo");

let ensayos = [];

/*************************
 * NUEVO ENSAYO
 *************************/
btnNuevoEnsayo.addEventListener("click", () => {
  window.location.href = "nuevo-ensayo.html";
});

/*************************
 * CARGAR ENSAYOS
 *************************/
async function cargarEnsayos() {
  listaEnsayos.innerHTML = "<li class='item-cargando'>Cargando ensayos...</li>";
  ensayos = [];

  const q = query(
    collection(db, "ensayos"),
    orderBy("fecha", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(docu => {
    ensayos.push({
      id: docu.id,
      ...docu.data()
    });
  });

  if (ensayos.length === 0) {
    listaEnsayos.innerHTML =
      "<li class='item-vacio'>No hay ensayos cargados</li>";
    return;
  }

  renderEnsayos(ensayos);
}

/*************************
 * RENDER ENSAYOS
 *************************/
function renderEnsayos(lista) {
  listaEnsayos.innerHTML = "";

  lista.forEach(e => {
    const li = document.createElement("li");
    li.className = "ensayo-item";

    const fecha = e.fecha?.toDate
      ? e.fecha.toDate().toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit"
        })
      : "--/--";

    li.innerHTML = `
      <div class="ensayo-principal">
        <strong>
          ${fecha} ${e.clienteNombre || "Cliente sin nombre"} – 
          ${e.nombreEnsayo || "Ensayo sin nombre"}
        </strong>
      </div>
    `;

    li.addEventListener("click", () => {
      window.location.href = `ensayo.html?id=${e.id}`;
    });

    listaEnsayos.appendChild(li);
  });
}

/*************************
 * BUSCADOR
 *************************/
buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase();

  const filtrados = ensayos.filter(e =>
    (e.clienteNombre || "").toLowerCase().includes(texto) ||
    (e.nombreEnsayo || "").toLowerCase().includes(texto)
  );

  renderEnsayos(filtrados);
});

/*************************
 * INIT
 *************************/
cargarEnsayos();
