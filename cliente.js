// cliente.js
import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   OBTENER ID DE LA URL
========================= */
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

if (!clienteId) {
  alert("No se recibió el ID del cliente");
  throw new Error("clienteId no definido");
}

/* =========================
   CARGAR DATOS DEL CLIENTE
========================= */
async function cargarCliente() {
  try {
    const ref = doc(db, "clientes", clienteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.error("Cliente no encontrado");
      return;
    }

    const c = snap.data();

    // Ajustá los IDs según tu HTML
    document.getElementById("nombre").innerText = c.nombre ?? "Sin nombre";
    document.getElementById("direccion").innerText = c.direccion ?? "";
    document.getElementById("zona").innerText = c.zona ?? "";

  } catch (error) {
    console.error("Error cargando cliente:", error);
  }
}

/* =========================
   CARGAR HISTORIAL DE VISITAS
========================= */
async function cargarVisitas(clienteId) {
  try {
    const visitasRef = collection(db, "visitas");

    const q = query(
      visitasRef,
      where("clienteId", "==", clienteId),
      orderBy("Fecha", "desc")
    );

    const snap = await getDocs(q);
    const contenedor = document.getElementById("historial");

    contenedor.innerHTML = "";

    if (snap.empty) {
      contenedor.innerHTML = "<p>Sin visitas registradas</p>";
      return;
    }

    snap.forEach(d => {
      const v = d.data();

      const fecha = v.Fecha?.seconds
        ? new Date(v.Fecha.seconds * 1000).toLocaleDateString()
        : "Fecha inválida";

      contenedor.innerHTML += `
        <div class="visita">
          <strong>${fecha}</strong><br>
          Lat: ${v.Lat}<br>
          Lng: ${v.Lng}
        </div>
      `;
    });

  } catch (error) {
    console.error("Error cargando visitas:", error);
  }
}

/* =========================
   INICIAR
========================= */
cargarCliente();
cargarVisitas(clienteId); y 
