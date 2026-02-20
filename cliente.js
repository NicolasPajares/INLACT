import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Obtener ID del cliente desde la URL
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

console.log("Cliente ID:", clienteId);

// ================= CLIENTE =================
async function cargarCliente() {
  try {
    const ref = doc(db, "clientes", clienteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn("Cliente no existe");
      return;
    }

    const c = snap.data();
    document.getElementById("nombre").innerText = c.nombre || "-";
    document.getElementById("direccion").innerText = c.direccion || "-";
    document.getElementById("zona").innerText = c.zona || "-";

  } catch (e) {
    console.error("Error cargando cliente:", e);
  }
}

// ================= VISITAS =================
async function cargarVisitas() {
  const lista = document.getElementById("historial");
  lista.innerHTML = "<li>Cargando visitas...</li>";

  try {
    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("Fecha", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      lista.innerHTML = "<li>No hay visitas registradas</li>";
      console.warn("Consulta OK, pero sin resultados");
      return;
    }

    lista.innerHTML = "";

    snap.forEach(doc => {
      const v = doc.data();
      const fecha = v.Fecha?.toDate
        ? v.Fecha.toDate().toLocaleString()
        : v.Fecha;

      const li = document.createElement("li");
      li.textContent = `📍 ${fecha}`;
      lista.appendChild(li);
    });

    console.log("Visitas cargadas:", snap.size);

  } catch (e) {
    console.error("Error cargando visitas:", e);
    lista.innerHTML = "<li>Error cargando visitas</li>";
  }
}

cargarCliente();
cargarVisitas();
