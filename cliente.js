console.log("Firestore DB:", db);
// cliente.js
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

// Elementos HTML
const nombreEl = document.getElementById("nombre");
const direccionEl = document.getElementById("direccion");
const zonaEl = document.getElementById("zona");
const historialEl = document.getElementById("historial");

if (!clienteId) {
  nombreEl.textContent = "Cliente no encontrado";
  historialEl.textContent = "";
  throw new Error("No se pasó clienteId por URL");
}

// =======================
// CARGAR CLIENTE
// =======================
async function cargarCliente() {
  try {
    const ref = doc(db, "clientes", clienteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      nombreEl.textContent = "Cliente inexistente";
      return;
    }

    const data = snap.data();

    nombreEl.textContent = data.nombre || "Sin nombre";
    direccionEl.textContent = data.direccion || "-";
    zonaEl.textContent = data.zona || "-";

  } catch (error) {
    console.error("❌ Error cargando cliente:", error);
    nombreEl.textContent = "Error al cargar cliente";
  }
}

// =======================
// CARGAR VISITAS
// =======================
async function cargarVisitas() {
  try {
    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("Fecha", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      historialEl.textContent = "No hay visitas registradas";
      return;
    }

    historialEl.innerHTML = "";

    snapshot.forEach(docSnap => {
      const v = docSnap.data();

      const fecha = v.Fecha?.toDate
        ? v.Fecha.toDate().toLocaleString()
        : "Sin fecha";

      const div = document.createElement("div");
      div.className = "visita";
      div.innerHTML = `
        <div><strong>Fecha:</strong> ${fecha}</div>
        <div class="muted">Lat: ${v.Lat ?? "-"} | Lng: ${v.Lng ?? "-"}</div>
      `;

      historialEl.appendChild(div);
    });

  } catch (error) {
    console.error("❌ Error cargando visitas:", error);
    historialEl.textContent = "Error al cargar historial";
  }
}

// =======================
cargarCliente();
cargarVisitas();

