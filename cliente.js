import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("ID de cliente no encontrado");
  throw new Error("ID faltante");
}

// Documento cliente
const clienteRef = doc(db, "clientes", clienteId);

async function cargarCliente() {
  try {
    const snap = await getDoc(clienteRef);

    if (!snap.exists()) {
      alert("Cliente no encontrado");
      return;
    }

    const data = snap.data();
    document.getElementById("nombre").textContent = data.nombre || "Sin nombre";
    document.getElementById("direccion").textContent =
      "📍 " + (data.dirección || "");
    document.getElementById("zona").textContent =
      "Zona: " + (data.zona || "");

    cargarVisitas();
  } catch (e) {
    console.error("Error cliente:", e);
    alert("Error cargando cliente");
  }
}

async function cargarVisitas() {
  const contenedor = document.getElementById("listaHistorial");
  contenedor.innerHTML = "";

  try {
    // 👇 ACÁ ESTÁ EL CAMBIO CLAVE
    const visitasRef = collection(db, "clientes", clienteId, "visitas");
    const q = query(visitasRef, orderBy("fecha", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      contenedor.textContent = "Sin visitas registradas";
      return;
    }

    snap.forEach(d => {
      const v = d.data();
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div><strong>${v.actividad || v.accion || "Visita"}</strong></div>
        <div>${v.observacion || ""}</div>
        <div class="fecha">
          ${v.fecha?.toDate?.().toLocaleString() || ""}
        </div>
      `;
      contenedor.appendChild(div);
    });

  } catch (e) {
    console.error("Error visitas:", e);
    contenedor.textContent = "Error cargando visitas";
  }
}

cargarCliente();
