/**********************
 * FIREBASE
 **********************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs
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
 * DOM
 **********************/
const nombreEl = document.getElementById("clienteNombre");
const datosEl = document.getElementById("clienteDatos");
const visitasEl = document.getElementById("listaVisitasCliente");

/**********************
 * INIT
 **********************/
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  if (!clienteId) {
    nombreEl.textContent = "Cliente no especificado";
    return;
  }

  await cargarCliente(clienteId);
  await cargarVisitas(clienteId);
});

/**********************
 * CLIENTE
 **********************/
async function cargarCliente(clienteId) {
  try {
    const ref = doc(db, "clientes", clienteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      nombreEl.textContent = "Cliente no encontrado";
      return;
    }

    const c = snap.data();

    nombreEl.textContent = c.nombre || "Sin nombre";

    datosEl.innerHTML = `
      <p><strong>Email:</strong> ${c.email || "-"}</p>
      <p><strong>Localidad:</strong> ${c.localidad || "-"}</p>
      <p><strong>Provincia:</strong> ${c.provincia || "-"}</p>
      <p><strong>ID:</strong> ${snap.id}</p>
    `;
  } catch (e) {
    console.error("Error cargando cliente:", e);
    nombreEl.textContent = "Error al cargar cliente";
  }
}

/**********************
 * VISITAS
 **********************/
async function cargarVisitas(clienteId) {
  visitasEl.innerHTML = "<li>Cargando visitas...</li>";

  try {
    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);

    visitasEl.innerHTML = "";

    if (snap.empty) {
      visitasEl.innerHTML = "<li>No hay visitas registradas</li>";
      return;
    }

    snap.forEach(doc => {
      const v = doc.data();

      const fecha = v.fecha?.toDate
        ? v.fecha.toDate().toLocaleString("es-AR")
        : "Sin fecha";

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${fecha}</strong><br>
        <small>${v.usuarioNombre || ""}</small>
      `;

      visitasEl.appendChild(li);
    });
  } catch (e) {
    console.error("Error cargando visitas:", e);
    visitasEl.innerHTML = "<li>Error al cargar visitas</li>";
  }
}
