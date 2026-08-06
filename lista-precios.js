/**********************
 * FIREBASE
 **********************/
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

/**********************
 * CONFIG FIREBASE
 **********************/
const firebaseConfig = {
  apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
  authDomain: "inlact.firebaseapp.com",
  projectId: "inlact",
  storageBucket: "inlact.firebasestorage.app",
  messagingSenderId: "143868382036",
  appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**********************
 * ELEMENTOS DOM
 **********************/
const listaEl = document.getElementById("listaPrecios");
const buscadorEl = document.getElementById("buscadorListas");
const btnNuevaLista = document.getElementById("btnNuevaLista");

let listas = [];

/**********************
 * NUEVA LISTA
 **********************/
btnNuevaLista.addEventListener("click", () => {
  window.location.href = "nueva-lista-precios.html";
});

/**********************
 * CARGAR LISTAS
 **********************/
async function cargarListas() {

  listaEl.innerHTML =
    "<li class='item-cargando'>Cargando listas de precios...</li>";

  listas = [];

  const q = query(
    collection(db, "listaprecios"),
    orderBy("fecha", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(d => {
    listas.push({
      id: d.id,
      ...d.data()
    });
  });

  if (listas.length === 0) {

    listaEl.innerHTML =
      "<li class='item-vacio'>No hay listas de precios cargadas</li>";

    return;
  }

  renderListas(listas);
}

/**********************
 * RENDER LISTAS
 **********************/
function renderListas(lista) {

  listaEl.innerHTML = "";

  lista.forEach(l => {

    const li = document.createElement("li");
    li.className = "precio-item";

    const fecha = l.fecha?.toDate
      ? l.fecha.toDate().toLocaleDateString("es-AR")
      : "--/--/----";

    const info = document.createElement("div");
    info.className = "precio-info";

    info.innerHTML = `
      <small>${fecha}</small>
      <strong>${l.nombre || "Lista sin nombre"}</strong>
    `;

    info.onclick = () => {
      window.location.href =
        `lista-precio.html?id=${l.id}`;
    };
        /* BOTÓN BORRAR */
    const btnBorrar = document.createElement("button");
    btnBorrar.className = "btn-borrar";
    btnBorrar.textContent = "✖";

    btnBorrar.onclick = async (e) => {
      e.stopPropagation();

      const ok = confirm(
        `¿Querés borrar la lista "${l.nombre}"?`
      );

      if (!ok) return;

      await deleteDoc(doc(db, "listaprecios", l.id));

      cargarListas();
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

  const filtradas = listas.filter(l =>
    (l.nombre || "").toLowerCase().includes(texto)
  );

  renderListas(filtradas);

});

/**********************
 * INIT
 **********************/
cargarListas();
