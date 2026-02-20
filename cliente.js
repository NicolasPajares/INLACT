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
  getDocs,
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

/**********************
 * CLIENTE
 **********************/
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  const nombreEl = document.getElementById("clienteNombre");
  const datosEl = document.getElementById("clienteDatos");
  const visitasEl = document.getElementById("listaVisitasCliente");

  if (!clienteId) {
    nombreEl.textContent = "Cliente no especificado";
    return;
  }

  try {
    /***************
     * DATOS CLIENTE
     ***************/
    const refCliente = doc(db, "clientes", clienteId);
    const snapCliente = await getDoc(refCliente);

    if (!snapCliente.exists()) {
      nombreEl.textContent = "Cliente no encontrado";
      return;
    }

    const cliente = snapCliente.data();

    nombreEl.textContent = cliente.nombre;

    datosEl.innerHTML = `
      <p><strong>Email:</strong> ${cliente.email || "-"}</p>
      <p><strong>Localidad:</strong> ${cliente.localidad || "-"}</p>
      <p><strong>Provincia:</strong> ${cliente.provincia || "-"}</p>
      <p><strong>ID:</strong> ${clienteId}</p>
    `;

    /***************
     * VISITAS
     ***************/
    visitasEl.innerHTML = "<li>Cargando visitas...</li>";

    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc")
    );

    const snapVisitas = await getDocs(q);

    visitasEl.innerHTML = "";

    if (snapVisitas.empty) {
      visitasEl.innerHTML = "<li>No hay visitas registradas</li>";
      return;
    }

    snapVisitas.forEach(doc => {
      const v = doc.data();
      const fecha = v.fecha?.toDate
        ? v.fecha.toDate().toLocaleString("es-AR")
        : "Sin fecha";

      const li = document.createElement("li");
      li.innerHTML = `<strong>${fecha}</strong>`;
      visitasEl.appendChild(li);
    });

  } catch (error) {
    console.error("❌ Error al cargar cliente:", error);
    visitasEl.innerHTML = "<li>Error al cargar visitas</li>";
  }
});
