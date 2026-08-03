/*************************
 * FIREBASE
 *************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
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

  listaEnsayos.innerHTML = "<li>Cargando ensayos...</li>";

  ensayos = [];

  const q = query(
    collection(db, "ensayos"),
    orderBy("fecha", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(d => {
    ensayos.push({
      id: d.id,
      ...d.data()
    });
  });

  if (ensayos.length === 0) {
    listaEnsayos.innerHTML = "<li>No hay ensayos cargados</li>";
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
    li.className = "cliente-item";

    // INFORMACIÓN
    const info = document.createElement("div");
    info.className = "cliente-info";

    const fecha = e.fecha?.toDate
      ? e.fecha.toDate().toLocaleDateString("es-AR")
      : "--/--/----";

    info.innerHTML = `
      <div class="fecha-ensayo">
        ${fecha}
      </div>

      <div class="cliente-ensayo">
        ${e.clienteNombre || "Cliente sin nombre"}
      </div>

      <div class="nombre-ensayo">
        ${e.nombreEnsayo || "Ensayo sin nombre"}
      </div>
    `;

    info.onclick = () => {
      window.location.href = `ensayo.html?id=${e.id}`;
    };

    /*************************
     * BOTÓN BORRAR
     *************************/
    const btnBorrar = document.createElement("button");
    btnBorrar.className = "btn-borrar";
    btnBorrar.textContent = "✖";

    btnBorrar.onclick = async (ev) => {

      ev.stopPropagation();

      const ok = confirm(
        `¿Querés borrar el ensayo "${e.nombreEnsayo}"?`
      );

      if (!ok) return;

      await deleteDoc(doc(db, "ensayos", e.id));

      cargarEnsayos();

    };

    li.appendChild(info);
    li.appendChild(btnBorrar);

    listaEnsayos.appendChild(li);

  });

}
/*************************
 * BUSCADOR
 *************************/
buscador.addEventListener("input", () => {

  const texto = buscador.value.toLowerCase();

  const filtrados = ensayos.filter(e =>

    (e.clienteNombre || "")
      .toLowerCase()
      .includes(texto)

    ||

    (e.nombreEnsayo || "")
      .toLowerCase()
      .includes(texto)

  );

  renderEnsayos(filtrados);

});

/*************************
 * INIT
 *************************/
cargarEnsayos();
