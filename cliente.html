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

// ============================
// Obtener clienteId desde URL
// ============================
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

console.log("Cliente ID:", clienteId);

// ============================
// Referencias HTML
// ============================
const nombreEl = document.getElementById("nombre");
const direccionEl = document.getElementById("direccion");
const zonaEl = document.getElementById("zona");
const historialEl = document.getElementById("historial");

// ============================
// Cargar datos del cliente
// ============================
async function cargarCliente() {
  try {
    const ref = doc(db, "clientes", clienteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      nombreEl.textContent = "Cliente no encontrado";
      return;
    }

    const data = snap.data();

    nombreEl.textContent = data.nombre || "-";
    direccionEl.textContent = data.direccion || "-";
    zonaEl.textContent = data.zona || "-";

  } catch (error) {
    console.error("❌ Error cargando cliente:", error);
  }
}

// ============================
// Cargar historial de visitas
// ============================
async function cargarVisitas() {
  try {
    historialEl.innerHTML = "<li>Cargando visitas...</li>";

    const q = query(
      collection(db, "visitas"),
      where("clienteId", "==", clienteId),
      orderBy("fecha", "desc") // 🔑 CLAVE: fecha en minúscula
    );

    const snap = await getDocs(q);

    historialEl.innerHTML = "";

    if (snap.empty) {
      historialEl.innerHTML = "<li>No hay visitas registradas</li>";
      return;
    }

    snap.forEach(docu => {
      const v = docu.data();
      console.log("VISITA:", v);

      const fecha = v.fecha?.toDate
        ? v.fecha.toDate().toLocaleString()
        : "-";

      const li = document.createElement("li");
      li.textContent = `📅 ${fecha} | 📍 ${v.lat}, ${v.lng}`;
      historialEl.appendChild(li);
    });

  } catch (error) {
    console.error("❌ Error cargando visitas:", error);
    historialEl.innerHTML = "<li>Error cargando visitas</li>";
  }
}

// ============================
// Inicializar
// ============================
if (!clienteId) {
  alert("Falta el ID del cliente en la URL");
} else {
  cargarCliente();
  cargarVisitas();
}
