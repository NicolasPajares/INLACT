/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
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
 * ELEMENTOS DOM
 **********************/
const listaEl = document.getElementById("listaEnsayos");
const buscadorEl = document.getElementById("buscadorEnsayos");
const btnNuevo = document.getElementById("btnNuevoEnsayo");

let ensayos = [];

/**********************
 * NUEVO ENSAYO
 **********************/
btnNuevo.addEventListener("click", () => {
  window.location.href = "nuevo-ensayo.html";
});

/**********************
 * CARGAR ENSAYOS
 **********************/
async function cargarEnsayos() {
  listaEl.innerHTML = "<li>Cargando ensayos...</li>";

  const snap = await getDocs(collection(db, "ensayos"));
  ensayos = [];

  snap.forEach(d => {
    ensayos.push({
      id: d.id,
      ...d.data()
    });
  });

  if (ensayos.length === 0) {
    listaEl.innerHTML = "<li>No hay ensayos cargados</li>";
    return;
  }

  renderEnsayos(ensayos);
}

/**********************
 * RENDER ENSAYOS
 **********************/
function renderEnsayos(lista) {
  listaEl.innerHTML = "";

  lista.forEach(e => {
    const li = document.createElement("li");
    li.className = "ensayo-item";

    const fecha = e.fecha?.toDate
      ? e.fecha.toDate().toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit"
        })
      : "--/--";

    const texto = `
      <strong>${fecha} ${e.cliente || "Cliente sin nombre"} – ${e.nombre || "Ensayo sin nombre"}</strong>
    `;

    /* INFO */
    const info = document.createElement("div");
    info.className = "ensayo-info";
    info.innerHTML = texto;

    info.onclick = () => {
      window.location.href = `ensayo.html?id=${e.id}`;
    };

    /* BOTÓN BORRAR */
    const btnBorrar = document.createElement("button");
    btnBorrar.className = "btn-borrar";
    btnBorrar.textContent = "✖";

    btnBorrar.onclick = async (ev) => {
      ev.stopPropagation();

      const ok = confirm(`¿Querés borrar el ensayo:\n"${e.nombre}"?`);
      if (!ok) return;

      await deleteDoc(doc(db, "ensayos", e.id));
      cargarEnsayos();
    };

    li.appendChild(info);
    li.appendChild(btnBorrar);
    listaEl.appendChild(li);
  });
}

/**********************
 * BUSCADOR
 **********************/
buscadorEl.addEventListener("input", () => {
  const texto = buscadorEl.value.toLowerCase();

  const filtrados = ensayos.filter(e =>
    (e.cliente || "").toLowerCase().includes(texto) ||
    (e.nombre || "").toLowerCase().includes(texto)
  );

  renderEnsayos(filtrados);
});

/**********************
 * INIT
 **********************/
cargarEnsayos();
